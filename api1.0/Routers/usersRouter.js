const express = require('express');
const router = express.Router();
const usersController = require('../Controllers/usersController');
const auth = require('../utils/auth');
const tool = require('../utils/tool');

// User Sign Up API endpoint
router.post('/signup', usersController.signUp);
// User Sign-in endpoint
router.post('/signin', usersController.signIn);

router.get('/:type/task_records', auth.verifyToken, usersController.getRecords);
router.put('/picture', auth.verifyToken, tool.uploadPicture().single('picture'), usersController.pictureUpdate);
router.get('/:id/profile', auth.verifyToken, usersController.getProfile);
router.put('/profile',auth.verifyToken ,usersController.profileUpdate);

module.exports = router;
