const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');


// Middleware
// const emailAuth = require('../middleware/emailAuth');
const duplicateEmail = require('../middlewares/duplicateEmail');
const isAdmin = require('../middlewares/isAdmin');
const adminConstraint = require('../middlewares/adminConstraint');
const { checkAccess } = require('../middlewares/RBAC/rbacMiddleware');


router.post('/:companyId/:branchId/email',isAdmin, checkAccess('read', 3), duplicateEmail ,emailController.email_post);




module.exports = router;