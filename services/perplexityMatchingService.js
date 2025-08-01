
const axios = require('axios');

console.log("Perplexity API Key:", process.env.PERPLEXITY_API_KEY ? "Loaded" : "MISSING");

const MAX_CONTENT_LENGTH = 6000; 

/**
 * Main function to analyze resume against job description using Perplexity API.
 * @param {string} resumeText
 * @param {string} jobDescription
 * @returns {Promise<object>} analysis result JSON
 */
async function analyzeResumeWithPerplexity(resumeText, jobDescription) {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error("Perplexity API key missing in env");
    return getBasicAnalysis(resumeText, jobDescription);
  }

  try {
    // Clean and truncate inputs to stay under payload size limits
    const cleanJobDesc = cleanText(jobDescription).substring(0, 2000);
    const cleanResume = cleanText(resumeText).substring(0, 4000);

    // Check approximate payload size (just to avoid large 413 errors)
    const payloadSize = JSON.stringify({ job: cleanJobDesc, resume: cleanResume }).length;
    if (payloadSize > MAX_CONTENT_LENGTH) {
      console.warn(`Payload too large (${payloadSize} chars), using chunked analysis`);
      return analyzeInChunks(cleanResume, cleanJobDesc);
    }

    // Compose the prompt carefully
    const prompt = `Analyze this resume against the job description and return JSON with:
- matchPercentage (0-100)
- matchingSkills: [{skill: string, confidence: number}]
- missingSkills: string[]
- recommendation: "Strong Match" | "Moderate Match" | "Weak Match"
- analysis: string (max 300 chars)
- experienceMatch: string (max 200 chars)
- educationMatch: string (max 200 chars)

Job: ${cleanJobDesc}
Resume: ${cleanResume}

Return ONLY valid JSON without any formatting or additional text.`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: "sonar-pro",  
        messages: [
          { role: "system", content: "You are a resume analysis API. Return ONLY valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    return processApiResponse(response);

  } catch (error) {
    if (error.response && error.response.status === 413) {
      console.warn('Payload too large, falling back to chunked analysis');
      return analyzeInChunks(resumeText, jobDescription);
    }
    console.error('Perplexity API Error:', error.response ? error.response.data : error.message);
    return getBasicAnalysis(resumeText, jobDescription);
  }
}

async function analyzeSkills(resumeText, jobDescription) {
  try {
    const prompt = `Extract matching and missing skills between resume and job description.
Resume skills: ${extractSkills(resumeText).join(', ')}
Job requirements: ${extractSkills(jobDescription).join(', ')}

Return JSON with {matchingSkills: [{skill, confidence}], missingSkills: string[]}`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: "sonar-pro",   
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const jsonMatch = response.data.choices[0].message.content.match(/{.*}/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { matchingSkills: [], missingSkills: [] };

  } catch (error) {
    console.error('Skills analysis failed:', error.response ? error.response.data : error.message);
    return { matchingSkills: [], missingSkills: [] };
  }
}

/**
 * Processes the API response, extracting and validating JSON from response content.
 */
function processApiResponse(response) {
  const content = response.data.choices[0].message.content;
  const jsonMatch = content.match(/{.*}/s);

  if (!jsonMatch) {
    throw new Error('Invalid JSON response from Perplexity API');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    matchPercentage: validatePercentage(parsed.matchPercentage),
    matchingSkills: validateSkillsArray(parsed.matchingSkills).slice(0, 10),
    missingSkills: validateStringArray(parsed.missingSkills).slice(0, 10),
    recommendation: validateRecommendation(parsed.recommendation),
    analysis: (parsed.analysis || "").substring(0, 300),
    experienceMatch: (parsed.experienceMatch || "").substring(0, 200),
    educationMatch: (parsed.educationMatch || "").substring(0, 200),
    source: "Perplexity AI"
  };
}

// Text cleaning utility
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.!,?;-]/g, '')
    .trim();
}

// Basic fallback analysis when API is unreachable or keys missing
function getBasicAnalysis(resumeText, jobDescription) {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);

  const matchingSkills = jobKeywords
    .filter(skill => resumeKeywords.includes(skill))
    .map(skill => ({ skill, confidence: 80 }));

  const missingSkills = jobKeywords.filter(skill => !resumeKeywords.includes(skill));

  const matchPercentage = Math.floor(
    (matchingSkills.length / Math.max(jobKeywords.length, 1)) * 100
  );

  return {
    matchPercentage,
    matchingSkills,
    missingSkills,
    recommendation: getRecommendation(matchPercentage),
    analysis: "Basic text analysis completed (AI service unavailable)",
    experienceMatch: "",
    educationMatch: "",
    source: "Basic Fallback"
  };
}

// Simple keyword extraction from a pre-set list
function extractKeywords(text) {
  const commonSkills = [
    "javascript", "node", "react", "python", "java", "angular",".Net","C#",
    "sql", "mongodb", "express", "aws", "docker",
    "typescript", "html", "css", "rest", "api"
  ];

  return commonSkills.filter(skill => new RegExp(`\\b${skill}\\b`, 'i').test(text));
}

// Skill extractor used by skill chunk analysis (very naive)
function extractSkills(text) {
  return extractKeywords(text);
}

// Recommendation calculation
function getRecommendation(score) {
  if (score >= 75) return "Strong Match";
  if (score >= 50) return "Moderate Match";
  return "Weak Match";
}

// Validation helpers
function validatePercentage(value) {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
}

function validateSkillsArray(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.filter(skill =>
    skill &&
    typeof skill.skill === 'string' &&
    typeof skill.confidence === 'number'
  );
}

function validateStringArray(items) {
  if (!Array.isArray(items)) return [];
  return items.filter(item => typeof item === 'string');
}

function validateRecommendation(value) {
  const valid = ["Strong Match", "Moderate Match", "Weak Match"];
  return valid.includes(value) ? value : "Weak Match";
}

/**
 * Chunking fallback for very large inputs.
 */
async function analyzeInChunks(resumeText, jobDescription) {
  const skillsAnalysis = await analyzeSkills(resumeText, jobDescription);
  const basicAnalysis = getBasicAnalysis(resumeText, jobDescription);

  return {
    ...basicAnalysis,
    matchingSkills: skillsAnalysis.matchingSkills,
    missingSkills: skillsAnalysis.missingSkills,
    source: "Perplexity AI (Chunked Analysis)"
  };
}

module.exports = {
  analyzeResumeWithPerplexity
};
