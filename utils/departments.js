// // utils/departments.js

// const departments = [
//     'QA', 'Developer', 'Tester','UI/UX','DevOps', 'Sales', 'Finance',
//     'Customer Support', 'Product', 'Design', 'Legal', 'Operationn'
//   ];
  
//   module.exports = { departments };
  

//------

// utils/departments.js

let departments = [
  'IT','NON-IT','Sales','IT Operation'
];

const getDepartments = () => departments;

const addDepartment = (newDept) => {
  if (!departments.includes(newDept)) {
    departments.push(newDept);
  }
  return departments;
};

module.exports = { getDepartments, addDepartment };
