const express = require("express");
const router = express.Router();
const locations = require("../utils/location");

router.get("/", (req, res) => {
  res.json(locations);
});

module.exports = router;
