const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

// Posts Created API
router.post('/', auth.verifyToken, tasksController.createTask);

// Posts Delete Like API
router.delete('/:id', auth.verifyToken, postsController.deletetask);

// User get search tasks API
router.get('/search',auth.verifyToken,tasksController.homeSearch);
<<<<<<< HEAD

// User get tasks detail API
router.get('/:id', auth.verifyToken, tasksController.tasksDetail);
=======
router.put('/:task_id',auth.verifyToken,tasksController.updateTask);
router.get('/:id', auth.verifyToken, tasksController.getDetail);
>>>>>>> 9be1c5b0de94544ef9bddabcb3593695b01d308d

module.exports = router;
