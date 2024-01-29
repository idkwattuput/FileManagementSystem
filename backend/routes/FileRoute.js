const express = require('express');
const router = express.Router();
const fileController = require('../controllers/FileController');

// Multer setup for file upload
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


// Route for file upload
router.post('/upload/:folderId?', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFileByUser)

module.exports = router;
