const express = require('express');
const router = express.Router();

const dsigmaUserController = require('../controllers/dsigmaUserController');


// Middleware
// const loginRequired = require('../middlewares/loginRequired');

router.post('/register', dsigmaUserController.register_post);

module.exports = router;