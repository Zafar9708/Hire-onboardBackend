// services/perplexityMatchingService.js
const axios = require('axios');

// Debug: Log API key status
console.log("Perplexity API Key:", process.env.PERPLEXITY_API_KEY ? "Loaded" : "MISSING");

async function analyzeResumeWithPerplexity(resumeText, jobDescription) {
  if (!process.env.PERPLEXITY_API_KEY) {
    console.error("Perplexity API key missing in env");
    return getBasicAnalysis(resumeText, jobDescription);
  }

  try {
    const prompt = `RESUME ANALYSIS INSTRUCTIONS:
    1. Compare the resume with the job description
    2. Generate JSON with these exact fields:
       - matchPercentage (number 0-100)
       - matchingSkills: [{skill: string, confidence: number}]
       - missingSkills: string[]
       - recommendation: "Strong Match" | "Moderate Match" | "Weak Match"
       - analysis: string
       - experienceMatch: string
       - educationMatch: string

    JOB DESCRIPTION:
    ${jobDescription.substring(0, 2000)}

    RESUME CONTENT:
    ${resumeText.substring(0, 10000)}

    RESPONSE REQUIREMENTS:
    - Return ONLY valid JSON
    - No additional text outside the JSON structure
    - Begin with { and end with }`;

    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: "sonar-pro", // Using the correct model name
        messages: [
          {
            role: "system",
            content: "You are a resume analysis API. Respond ONLY with valid JSON containing the requested fields."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Extract and clean the JSON response
    const responseText = response.data.choices[0].message.content;
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid response format - no JSON found');
    }

    const jsonString = responseText.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(jsonString);

    // Validate and format the response
    return {
      matchPercentage: validatePercentage(parsed.matchPercentage),
      matchingSkills: validateSkillsArray(parsed.matchingSkills),
      missingSkills: validateStringArray(parsed.missingSkills),
      recommendation: validateRecommendation(parsed.recommendation),
      analysis: parsed.analysis || "",
      experienceMatch: parsed.experienceMatch || "",
      educationMatch: parsed.educationMatch || "",
      source: "Perplexity AI"
    };

  } catch (error) {
    console.error('Perplexity Analysis Failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });
    
    return getBasicAnalysis(resumeText, jobDescription);
  }
}

// Validation helper functions
function validatePercentage(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
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

// Fallback analysis functions
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

function extractKeywords(text) {
  const commonSkills = [
    "javascript", "node", "react", "python", "java", "angular",".Net","C#",
    "sql", "mongodb", "express", "aws", "docker",
    "typescript", "html", "css", "rest", "api"
  ];
  
  return commonSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
}

function getRecommendation(score) {
  if (score >= 75) return "Strong Match";
  if (score >= 50) return "Moderate Match";
  return "Weak Match";
}

module.exports = {
  analyzeResumeWithPerplexity: analyzeResumeWithPerplexity
};