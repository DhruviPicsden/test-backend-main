const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');


// Middleware
const kioskLoginRequired = require('../middlewares/kioskLoginRequired');
const LoginRequired = require('../middlewares/loginRequired');

// Kiosk Login
router.post('/login',kioskController.login_post);
// All Employees
router.get('/dashboard',kioskLoginRequired, kioskController.dashboard_get);
// Employee Login
router.post('/:employeeId/login',kioskLoginRequired, kioskController.employeeLogin_post);
// Start Shift
router.post('/startshift/:empId', LoginRequired, kioskController.employeeStartShift_post);
// Start Break
router.patch('/startbreak/:empId', LoginRequired, kioskController.employeeStartBreak_patch);
// End Break
router.patch('/endbreak/:empId', LoginRequired, kioskController.employeeEndBreak_patch);
// End Shift
router.patch('/endShift/:empId', LoginRequired, kioskController.employeeEndShift_patch);
// Get Shifts by Employee
router.post('/shifts/:employeeId', LoginRequired, kioskController.getShiftsByEmployeeId_post);

router.get('/schedule/:employeeId', LoginRequired, kioskController.getScheduleByEmployeeId_get);



module.exports = router;