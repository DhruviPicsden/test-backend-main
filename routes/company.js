const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');


// Middleware
// const loginRequired = require('../middlewares/loginRequired');
const isAdmin = require('../middlewares/isAdmin');
const adminConstraint = require('../middlewares/adminConstraint');

router.post('/register', adminConstraint, companyController.register_post);

module.exports = router;