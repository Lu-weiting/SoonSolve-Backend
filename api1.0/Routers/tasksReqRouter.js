const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const tasksReqController = require('../Controllers/tasksReqController');
router.post('/:task_id/request', auth.verifyToken, tasksReqController.sendRequest);
router.delete('/:user_task_id', auth.verifyToken, tasksReqController.deleteRequest);



module.exports = router;