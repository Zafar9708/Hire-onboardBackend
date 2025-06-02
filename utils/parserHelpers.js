const extractSkills = (text) => {
    const knownSkills = [
      'JavaScript', 'Node.js', 'React', 'Python', 'Django',
      'MongoDB', 'SQL', 'HTML', 'CSS', 'AWS', 'Express'
    ];
    const found = knownSkills.filter(skill =>
      text.toLowerCase().includes(skill.toLowerCase())
    );
    return [...new Set(found)].join(', ');
  };
  
  const extractExperience = (text) => {
    const expMatch = text.match(/([0-9]+)\+?\s?(years|yrs|year)?/i);
    return expMatch ? `${expMatch[1]} years` : 'Not mentioned';
  };
  
  module.exports = { extractSkills, extractExperience };
  