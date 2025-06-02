const express = require('express');
const { getCompany } = require('../controllers/companyController');

const router = express.Router();

router.get('/', getCompany);

module.exports = router;
