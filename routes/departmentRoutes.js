

const express = require('express');
const router = express.Router();
const { departments } = require('../utils/departments');

router.get('/', (req, res) => {
  console.log("GET /api/departments called");
  res.status(200).json(departments);
});

module.exports = router;

  
