const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get('/profile', auth, userController.getProfile);
router.get('/quota', auth, userController.getQuota);

module.exports = router;