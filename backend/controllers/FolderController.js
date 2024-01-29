const asyncHandler = require('express-async-handler');
const pool = require('../config/dbConn');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const createFolder = asyncHandler(async (req, res) => {
    try {
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;
        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;

        const { folderName, parentFolderId } = req.body;

        // Check if the user has a default folder, create one if not
        const userFoldersQuery = 'SELECT id FROM folders WHERE user_folder_id = ? LIMIT 1';
        const [userFoldersResult] = await pool.execute(userFoldersQuery, [userId]);

        let parentId;

        if (userFoldersResult.length === 0) {
            // If the user doesn't have any folders, create a default folder
            const defaultFolderQuery = 'INSERT INTO folders (name, user_folder_id) VALUES (?, ?)';
            const [defaultFolderResult] = await pool.execute(defaultFolderQuery, ['Default Folder', userId]);

            parentId = defaultFolderResult.insertId;
        } else {
            // Use the specified parentFolderId or default to the user's default folder
            parentId = parentFolderId || userFoldersResult[0].id;
        }

        // Insert folder metadata into the database
        const insertQuery = 'INSERT INTO folders (name, parent_folder_id, user_folder_id) VALUES (?, ?, ?)';
        const [result] = await pool.execute(insertQuery, [folderName, parentId, userId]);

        // Create the physical folder on the server
        const folderPath = path.join(__dirname, '../uploads', userId.toString(), folderName);
        fs.mkdirSync(folderPath, { recursive: true });

        res.status(200).json({ message: 'Folder created successfully', folderId: result.insertId });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// // Helper function to get the name of the parent folder
// async function getParentFolderName(parentFolderId) {
//     const parentFolderNameQuery = 'SELECT name FROM folders WHERE id = ?';
//     const [parentFolder] = await pool.execute(parentFolderNameQuery, [parentFolderId]);
//     return parentFolder.length > 0 ? parentFolder[0].name : '';
// }


const getFolders = asyncHandler(async (req, res) => {
    try {
        const { parentFolderId } = req.params;

        const selectQuery = 'SELECT * FROM folders WHERE parent_folder_id = ? AND user_folder_id = ?';
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;
        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;

        const [result] = await pool.execute(selectQuery, [parentFolderId, userId]);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting folders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const getAllUserFoldersByUserId = asyncHandler(async (req, res) => {
    try {
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;
        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;

        const selectQuery = 'SELECT * FROM folders WHERE user_folder_id = ?';
        const [result] = await pool.execute(selectQuery, [userId]);

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user folders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const deleteFolder = asyncHandler(async (req, res) => {
    try {
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;
        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;

        const { folderId } = req.params;

        // Check if the folder exists
        const folderExistsQuery = 'SELECT * FROM folders WHERE id = ? AND user_folder_id = ?';
        const [folderResult] = await pool.execute(folderExistsQuery, [folderId, userId]);

        if (folderResult.length === 0) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Delete the folder and its children from the database
        await deleteFolderRecursiveFromDatabase(folderId);

        // Delete the physical folder on the server
        const folderPath = path.join(__dirname, '../uploads', userId.toString(), folderResult[0].name);
        await deleteFolderRecursive(folderPath);

        res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Helper function to delete a folder and its children from the database recursively
async function deleteFolderRecursiveFromDatabase(folderId) {
    // Delete files within the folder (optional, depending on your requirements)
    // You need to implement a function to delete files associated with the folder

    // Get child folders
    const getChildFoldersQuery = 'SELECT id FROM folders WHERE parent_folder_id = ?';
    const [childFolders] = await pool.execute(getChildFoldersQuery, [folderId]);

    // Recursively delete child folders
    for (const childFolder of childFolders) {
        await deleteFolderRecursiveFromDatabase(childFolder.id);
    }

    // Delete folder metadata from the database
    const deleteFolderQuery = 'DELETE FROM folders WHERE id = ?';
    await pool.execute(deleteFolderQuery, [folderId]);
}

// Helper function to delete a folder and its content recursively
async function deleteFolderRecursive(folderPath) {
    try {
        const folderContents = await fs.promises.readdir(folderPath);

        for (const content of folderContents) {
            const contentPath = path.join(folderPath, content);
            const contentStats = await fs.promises.stat(contentPath);

            if (contentStats.isDirectory()) {
                await deleteFolderRecursive(contentPath);
            } else {
                await fs.promises.unlink(contentPath);
            }
        }

        await fs.promises.rmdir(folderPath);
    } catch (error) {
        console.error('Error deleting folder content:', error);
        throw error;
    }
}

module.exports = {
    createFolder,
    getFolders,
    getAllUserFoldersByUserId,
    deleteFolder
};
