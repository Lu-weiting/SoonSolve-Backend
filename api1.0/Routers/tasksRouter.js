const express = require('express');
const router = express.Router();
const tasksController = require('../Controllers/tasksController');
const auth = require('../utils/auth');
//const upload = require('../utils/upload');

<<<<<<< HEAD
// Posts Created API
router.post('/', auth.verifyToken, tasksController.createTask);

// User get search tasks API
router.get('/search',auth.verifyToken,tasksController.homeSearch);

=======
>>>>>>> 738b1c5b1460bbd33e804732b211c7c58cd5a614
// User get tasks detail API
router.get('/:id', auth.verifyToken, tasksController.tasksDetail);

module.exports = router;
