const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// Posts Created API
router.post('/', auth.verifyToken, tasksController.createTask);

// User get search tasks API
router.get('/search',auth.verifyToken,tasksController.homeSearch);

// User get tasks detail API
router.get('/:id', auth.verifyToken, tasksController.tasksDetail);

module.exports = router;
