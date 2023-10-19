const express = require('express');
const router = express.Router();

const DepartmentController = require('../controllers/departmentController');
const adminConstraint = require('../middlewares/adminConstraint');
const loginRequired = require('../middlewares/loginRequired');

router.post('/createDepartment/:branchId',adminConstraint, DepartmentController.createDepartment_post);

router.get('/getDepartments/:branchId', adminConstraint,DepartmentController.getDepartments_get);

router.put('/updateDepartment/:id', adminConstraint,DepartmentController.updateDepartment_put);

router.delete('/deleteDepartment/:id',adminConstraint, DepartmentController.deleteDepartment_delete);

router.get('/employee/getDepartment/:empId',loginRequired, DepartmentController.getDepartmentByEmployee_get);

router.post('/employee/assignDepartment/:empId',adminConstraint, DepartmentController.assignDepartment_post);

module.exports = router;








