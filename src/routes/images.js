const express = require('express')
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middlewares/auth');
const quota = require('../middlewares/quota');
const upload = require('../middlewares/upload');

router.post('/upload', auth, quota, upload.single('image'), imageController.uploadImage);
router.get('/', auth, imageController.listImages);

module.exports = router;