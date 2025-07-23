const natural = require('natural');
const { removeStopwords } = require('stopword');

function preprocessText(text) {
  if (!text) return [];
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return removeStopwords(tokens);
}

function calculateSimilarity(text1, text2) {
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return 0;
  
  const allWords = [...new Set([...tokens1, ...tokens2])];
  const vec1 = allWords.map(word => tokens1.filter(t => t === word).length);
  const vec2 = allWords.map(word => tokens2.filter(t => t === word).length);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < allWords.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  return mag1 * mag2 !== 0 ? dotProduct / (mag1 * mag2) : 0;
}

async function calculateMatchScore(resumeId, jobDescription) {
  try {
    const resume = await Resume.findById(resumeId).lean();
    if (!resume) return { score: 0, details: {} };

    const resumeText = [
      resume.skills?.join(' ') || '',
      resume.experience || '',
      resume.education || ''
    ].join(' ');

    const skillsMatch = calculateSimilarity(
      resume.skills?.join(' ') || '',
      jobDescription.skillsRequired?.join(' ') || ''
    );
    
    const experienceMatch = calculateSimilarity(
      resume.experience || '',
      jobDescription.experienceRequired || ''
    );
    
    const educationMatch = calculateSimilarity(
      resume.education || '',
      jobDescription.educationRequired || ''
    );
    
    const overallMatch = (
      0.5 * skillsMatch + 
      0.3 * experienceMatch + 
      0.2 * educationMatch
    );

    return {
      score: Math.round(overallMatch * 100),
      details: {
        skills: {
          match: Math.round(skillsMatch * 100),
          resume: resume.skills || [],
          required: jobDescription.skillsRequired || []
        },
        experience: {
          match: Math.round(experienceMatch * 100),
          resume: resume.experience || '',
          required: jobDescription.experienceRequired || ''
        },
        education: {
          match: Math.round(educationMatch * 100),
          resume: resume.education || '',
          required: jobDescription.educationRequired || ''
        }
      }
    };
  } catch (error) {
    console.error('Error calculating match score:', error);
    return { score: 0, details: {} };
  }
}

module.exports = {
  calculateMatchScore
};