const express = require('express');
const router = express.Router();

//Middleware
const loginRequired = require('../middlewares/loginRequired');
const otpAuth = require('../middlewares/otpAuth'); 

// Controller 
const authController = require('../controllers/authController');
const isAdmin = require('../middlewares/isAdmin');

// DsigmaUser Login
router.post('/user/login', authController.DsUser_login_post);

// Employee Login
router.post('/employee/login', authController.emp_login_post);
router.post('/user/otp', authController.DsigmaUserSendOTP_post);
router.post('/employee/otp', authController.employeeSendOTP_post);
router.post('/otp/confirm', authController.otpConfirmation_post);
router.post('/otp/resetpassword', otpAuth,authController.newPassword_post);
router.post('/employee/defaultPasswordChange', isAdmin, authController.defaultPasswordChange);
// router.post('/test', authController.test2);

module.exports = router;
