const Employee = require("../models/Employee");


exports.createEmployee = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const employee = await Employee.create({ name, email, role });
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
