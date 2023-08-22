const express = require('express');
const router = express.Router();
const eventsController = require('../Controllers/eventsController');
const auth = require('../utils/auth');


router.get('/', auth.verifyToken, eventsController.getEvent);
router.post('/:event_id/read', auth.verifyToken, eventsController.readEvent);


module.exports = router;
