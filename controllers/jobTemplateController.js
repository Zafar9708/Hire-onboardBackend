const templates = require('../data/templates.json'); 

const getJobTemplates = (req, res) => {
  try {
    console.log('📦 Templates loaded:', templates);
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job templates.' });
  }
};

module.exports = {
  getJobTemplates
};
