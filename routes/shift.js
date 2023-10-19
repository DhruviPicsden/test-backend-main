const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { checkAccess } = require('../middlewares/RBAC/rbacMiddleware');
const isAdmin = require('../middlewares/isAdmin');
const adminConstraint = require('../middlewares/adminConstraint');
const Module = require('../models/company/module');

// let module_name = 'Shift';
// let moduleItem = Module.findOne({ where: { name: module_name } });
// if (moduleItem === null) {
//     moduleItem = Module.create({ name: module_name });
// }
const module_id = 2;
// Create Shift Shift 
router.post('/employee/addshift/:empId',adminConstraint,  shiftController.createShift_post);
//  Fetch all shifts with user details 
router.post('/employees/shifts', isAdmin, checkAccess('read', module_id) ,shiftController.shifts_post);
// Approve shift 
router.patch('/employee/shiftapprove/:shiftId',isAdmin, checkAccess('write', module_id), shiftController.approve_patch);
// Delete shift 
router.delete('/employee/shiftdelete/:shiftId', isAdmin,adminConstraint, shiftController.shiftDelete_delete);
// Edit shift 
router.patch('/employee/shiftedit/:shiftId', isAdmin, checkAccess('write' ,module_id) ,shiftController.shiftEdit_patch);
// Single Shift
router.get('/employee/shift/:shiftId', isAdmin, checkAccess('read', module_id), shiftController.shift_get);





module.exports = router;