// const extractSkills = (text) => {
//     const knownSkills = [
//       'JavaScript', 'Node.js', 'React', 'Python', 'Django',
//       'MongoDB', 'SQL', 'HTML', 'CSS', 'AWS', 'Express'
//     ];
//     const found = knownSkills.filter(skill =>
//       text.toLowerCase().includes(skill.toLowerCase())
//     );
//     return [...new Set(found)].join(', ');
//   };
  
//   const extractExperience = (text) => {
//     const expMatch = text.match(/([0-9]+)\+?\s?(years|yrs|year)?/i);
//     return expMatch ? `${expMatch[1]} years` : 'Not mentioned';
//   };
  
//   module.exports = { extractSkills, extractExperience };
  

//----------

// utils/parserHelpers.js
exports.extractName = (text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  const email = exports.extractEmail(text);
  const emailLineIndex = lines.findIndex(line => line.includes(email));

  let fullName = '';
  if (emailLineIndex > 0) {
    const possibleName = lines[emailLineIndex - 1].replace(/\t+/g, ' ').trim();
    const nameMatch = possibleName.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/);
    if (nameMatch) fullName = nameMatch[0];
  }

  if (!fullName) fullName = lines[0].replace(/\t+/g, ' ').trim();

  const nameParts = fullName.split(' ');
  return {
    firstName: nameParts[0] || '',
    middleName: nameParts.length === 3 ? nameParts[1] : '',
    lastName: nameParts[nameParts.length - 1] || ''
  };
};

exports.extractEmail = (text) => {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return emailMatch ? emailMatch[0] : '';
};

exports.extractPhone = (text) => {
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0] : '';
};

exports.extractSkills = (text) => {
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'Express'
  ];
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  return foundSkills.join(', ');
};

exports.extractExperience = (text) => {
  const match = text.match(/(\d{1,2})\s*\+?\s*(years|yrs)/i);
  return match ? `${match[1]} years` : '';
};

exports.extractEducation = (text) => {
  const match = text.match(/(B\.?Tech|M\.?Tech|Bachelor|Master|BSc|MSc|BE)[^\n]*/i);
  return match ? match[0] : '';
};