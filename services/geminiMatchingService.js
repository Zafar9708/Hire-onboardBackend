const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize with explicit API version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResumeWithGemini(resumeText, jobDescription) {
  try {
    // Try the most current model names
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Newest recommended model
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2000
      }
    });

    const prompt = `Analyze this resume against the job description and return JSON with:
    - matchPercentage (0-100)
    - matchingSkills: {skill: string, confidence: number}[]
    - missingSkills: string[]
    - recommendation: "Strong Match" | "Moderate Match" | "Weak Match"
    - analysis: string
    - experienceMatch: string
    - educationMatch: string

    Job: ${jobDescription.substring(0, 2000)}
    Resume: ${resumeText.substring(0, 10000)}

    Return ONLY valid JSON without any formatting or additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and parse response
    const jsonString = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return {
      matchPercentage: parsed.matchPercentage || 0,
      matchingSkills: parsed.matchingSkills || [],
      missingSkills: parsed.missingSkills || [],
      recommendation: parsed.recommendation || "Weak Match",
      analysis: parsed.analysis || "",
      experienceMatch: parsed.experienceMatch || "",
      educationMatch: parsed.educationMatch || "",
      source: "Gemini AI"
    };

  } catch (error) {
    console.error('Gemini Analysis Failed:', {
      message: error.message,
      status: error.status,
      details: error.errorDetails
    });
    
    return getBasicAnalysis(resumeText, jobDescription);
  }
}

// Enhanced fallback analysis
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
  analyzeResumeWithGemini
};