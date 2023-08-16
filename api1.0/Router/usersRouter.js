const express = require('express');
const router = express.Router();
const usersController = require('../Controllers/usersController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// User Sign Up API endpoint
//router.post('/signup', usersController.signup);

// User Sign-in endpoint
//router.post('/signin', usersController.signin);

// User Sign-in endpoint

router.get('/task_records/:type', auth.verifyToken, usersController.getRecords);
router.get('/:id/profile', auth.verifyToken, usersController.getProfile);
module.exports = router;
