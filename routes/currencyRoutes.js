const express = require("express");
const router = express.Router();
const currencies = require("../utils/currency");

router.get("/", (req, res) => {
  res.json(currencies);
});

module.exports = router;
