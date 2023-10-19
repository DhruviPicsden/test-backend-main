    const express = require('express');
const router = express.Router();

const RoleController = require('../controllers/roleController');
const adminConstraint = require('../middlewares/adminConstraint');
const isAdmin = require('../middlewares/isAdmin');

router.post('/createRole/:branchId', adminConstraint, RoleController.createRole_post);

router.get('/getRoles/:branchId',adminConstraint, RoleController.getRoles_get);

router.get('/getRole/:id',adminConstraint, RoleController.getRole_get);

router.put('/updateRole/:id',adminConstraint, RoleController.updateRole_put);

router.delete('/deleteRole/:id',adminConstraint, RoleController.deleteRole_delete);

router.get('/employee/getRole/:empId',adminConstraint, RoleController.getRole_get);

router.post('/employee/assignRole/:empId',adminConstraint, RoleController.assignRole_post);

router.get('/getModules',adminConstraint, RoleController.getModules_get);

module.exports = router;








