const express = require('express');
const router = express.Router();
const folderController = require('../controllers/FolderController');

// Route for folder creation
router.post('/create-folder', folderController.createFolder);

// Route for getting folders within a parent folder
router.get('/get-folders/:parentFolderId', folderController.getFolders);
router.get('/get-user-folders', folderController.getAllUserFoldersByUserId);
router.delete('/:folderId', folderController.deleteFolder);

module.exports = router;
