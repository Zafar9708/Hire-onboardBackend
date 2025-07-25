// const express = require("express");
// const router = express.Router();
// const locations = require("../utils/location");

// router.get("/", (req, res) => {
//   res.json(locations);
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// GET all locations
router.get('/', locationController.getAllLocations);

// POST create new location
router.post('/', locationController.createLocation);

module.exports = router;