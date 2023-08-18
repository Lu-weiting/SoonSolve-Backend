const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// Posts Created API
router.post('/', auth.verifyToken, tasksController.createTask);

// Posts Delete Like API
router.delete('/:id', auth.verifyToken, tasksController.deletetask);

// User get search tasks API
router.get('/search',auth.verifyToken,tasksController.homeSearch);

// User update tasks API
router.put('/:task_id',auth.verifyToken,tasksController.updateTask);

// User get tasks details API
router.get('/:id', auth.verifyToken, tasksController.tasksDetail);

router.put('/:status/:id',auth.verifyToken,tasksController.updateTaskstatus);

module.exports = router;
