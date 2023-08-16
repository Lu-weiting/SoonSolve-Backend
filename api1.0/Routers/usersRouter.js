const express = require('express');
const router = express.Router();
const usersController = require('../Controllers/usersController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// User Sign Up API endpoint
router.post('/signup', usersController.signUp);
// User Sign-in endpoint
router.post('/signin', usersController.signIn);


router.get('/:type/task_records', auth.verifyToken, usersController.getRecords);
router.get('/:id/profile', auth.verifyToken, usersController.getProfile);
module.exports = router;
