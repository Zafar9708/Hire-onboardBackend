const pdfParse = require('pdf-parse');
const textract = require('textract');

const parseResume = async (file) => {
  try {
    let text = '';
    
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      text = data.text;
    } else {
      text = await new Promise((resolve, reject) => {
        textract.fromBufferWithName(file.originalname, file.buffer, (err, text) => {
          if (err) reject(err);
          else resolve(text);
        });
      });
    }

    // Extract email
    const email = text.match(/\S+@\S+\.\S+/)?.toString() || '';
    
    // Extract phone (US/India format)
    const phone = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.toString() || '';
    
    // Extract name (first two capitalized words)
    const nameMatch = text.match(/^([A-Z][a-z]+\s[A-Z][a-z]+)/);
    const name = nameMatch ? nameMatch[0] : '';
    
    // Extract skills
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL'];
    const skills = commonSkills.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(text)
    ).join(', ');

    // Extract experience
    const expMatch = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
    const experience = expMatch ? `${expMatch[1]} years` : '';

    return { name, email, phone, skills, experience };
  } catch (error) {
    console.error('Resume parsing error:', error);
    return {};
  }
};

module.exports = { parseResume };