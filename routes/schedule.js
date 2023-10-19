const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');
const adminConstraint = require('../middlewares/adminConstraint');
const scheduleController = require('../controllers/scheduleController');
const Module = require('../models/company/module');
const { checkAccess } = require('../middlewares/RBAC/rbacMiddleware');

// let module_name = 'Schedule';
// let moduleItem = Module.findOne({ where: { name: module_name } });
// if (moduleItem === null) {
//     moduleItem = Module.create({ name: module_name });
// }
const module_id = 3;


// router.post('/schedule/add', isAdmin,  scheduleController.createScheduleItem);
router.post('/schedule/add', isAdmin, checkAccess('write', module_id), scheduleController.createScheduleItem);
router.post('/schedule', isAdmin, checkAccess('read', module_id), scheduleController.getScheduleItems);
router.delete('/schedule/delete/:scheduleId', isAdmin, checkAccess('write', module_id), scheduleController.deleteScheduleItem);
router.post('/schedule/publish', isAdmin, checkAccess('write', module_id), scheduleController.publishShiftsForWeek);
router.patch('/schedule/update/:scheduleId',isAdmin, checkAccess('write', module_id),  isAdmin, scheduleController.updateScheduleItem);
router.get('/schedule/employee/:empId', isAdmin, checkAccess('read', module_id), scheduleController.getEmployeeSchedules);
router.get('/schedule/employees', isAdmin,checkAccess('write', module_id), scheduleController.employeesForSchedule_get);
router.post('/schedule/copy', isAdmin, checkAccess('write', module_id), scheduleController.copySchedule);
router.post('/schedule/deleteForWeek', isAdmin, checkAccess('write', module_id), scheduleController.deleteShiftsForWeek);



module.exports = router;    