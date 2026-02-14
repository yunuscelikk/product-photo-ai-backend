const express = require('express')
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.post('/upload', auth, upload.single('image'), imageController.uploadImage);
router.get('/', auth, imageController.listImages);

module.exports = router;