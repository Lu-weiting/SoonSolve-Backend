const express = require('express');
const router = express.Router();
const usersController = require('../controller/usersController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// User Sign Up API endpoint
router.post('/signup', usersController.signup);

// User Sign-in endpoint
router.post('/signin', usersController.signin);

module.exports = router;
