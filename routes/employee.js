const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { checkAccess } = require('../middlewares/RBAC/rbacMiddleware');

// Middleware
const loginRequired = require('../middlewares/loginRequired');
const isAdmin = require('../middlewares/isAdmin');
const adminConstraint = require('../middlewares/adminConstraint');
const Module = require('../models/company/module');

// let module_name = 'Employee';
// let moduleItem = Module.findOne({ where: { name: module_name } });
// if (moduleItem === null) {
//     moduleItem = Module.create({ name: module_name });
// }
const module_id = 1;


// Employee Details Form
router.patch('/employee/detailsform',loginRequired,employeeController.form_post);
// All Employees
router.get('/employees', isAdmin, checkAccess('read', module_id) ,employeeController.employees_get);
// Update Employee
router.patch('/employee/update/:empId', loginRequired, isAdmin, checkAccess('write', module_id), employeeController.employee_patch);
// Get Employee
router.get('/employee/:empId', loginRequired, isAdmin,checkAccess('read', module_id), employeeController.employee_get);
// Delete Employee
router.delete('/employee/:empId', adminConstraint,employeeController.employee_delete);
// Activate Employee
router.patch('/employee/activate/:empId', loginRequired, isAdmin, checkAccess('write', module_id),employeeController.activateEmployee_patch);
//Register Employee 
router.post('/employee/register', employeeController.register_post);
// Make Admin
router.post('/employee/makeadmin/:empId',adminConstraint, employeeController.makeAdmin_post);
// Get shifts details by employee id
router.get('/employee/shifts/:empId',loginRequired, checkAccess('read', module_id), employeeController.getShiftsByEmployeeId_get);




module.exports = router;