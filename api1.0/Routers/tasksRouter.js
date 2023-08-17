const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// User get tasks detail API
router.get('/search',auth.verifyToken,tasksController.homeSearch);
router.put('/:task_id',auth.verifyToken,tasksController.updateTask);
router.get('/:id', auth.verifyToken, tasksController.getDetail);

module.exports = router;
