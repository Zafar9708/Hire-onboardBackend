const express = require("express");
const router = express.Router();
const {createEmployee,getEmployees,deleteEmployee} = require("../controllers/employeeController");

router.post("/", createEmployee);
router.get("/", getEmployees);
router.delete("/:id", deleteEmployee);

module.exports = router;
