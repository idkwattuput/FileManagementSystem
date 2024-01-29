const asyncHandler = require('express-async-handler');
const pool = require('../config/dbConn');
const fs = require('fs')
const path = require('path')
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken')


const uploadFile = asyncHandler(async (req, res) => {
    try {
        const folderId = req.params.folderId || null;
        const fileData = req.file.filename; // Always use req.file.buffer to get the file data

        let targetFolderId;

        // If not provided, assume it's the user's folder
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;

        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;

        // Check if folderId is provided
        if (!folderId) {
            // Check if the user has any folders
            const userFoldersQuery = 'SELECT * FROM folders WHERE user_folder_id = ? AND name = "Default Folder" LIMIT 1';
            const [userFoldersResult] = await pool.execute(userFoldersQuery, [userId]);

            if (userFoldersResult.length === 0) {
                // If the user doesn't have any folders, create a default folder
                const defaultFolderQuery = 'INSERT INTO folders (name, user_id) VALUES (?, ?)';
                const [defaultFolderResult] = await pool.execute(defaultFolderQuery, ['Default Folder', userId]);

                targetFolderId = defaultFolderResult.insertId;
            } else {
                // Use the first folder of the user
                targetFolderId = userFoldersResult[0].id;
            }
        } else {
            // Use the specified folderId
            targetFolderId = folderId;

            // Ensure the target folder exists, if not, create it
            const folderExistsQuery = 'SELECT * FROM folders WHERE id = ? AND user_folder_id = ?';
            const [folderExistsResult] = await pool.execute(folderExistsQuery, [targetFolderId, userId]);

            if (folderExistsResult.length === 0) {
                // Folder doesn't exist or doesn't belong to the user, handle as needed (e.g., return an error)
                return res.status(404).json({ message: 'Specified folder not found or does not belong to the user' });
            }
        }

        const uploadPath = path.join(__dirname, '../uploads', targetFolderId.toString(), req.file.originalname);
        console.log(uploadPath)
        // Create the folder structure if it doesn't exist
        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

        // Write the file data to the specified path
        fs.writeFileSync(uploadPath, fileData);

        // Insert file metadata into the database
        const insertQuery = 'INSERT INTO files (filename, mimetype, filedata, folder_id, user_id) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.execute(insertQuery, [
            req.file.originalname,
            req.file.mimetype,
            fileData,
            targetFolderId,
            userId
        ].map(value => (value !== undefined ? value : null))); // Ensure that undefined values are converted to null

        res.status(200).json({ message: 'File uploaded successfully', fileId: result.insertId });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



const getFileByUser = asyncHandler(async (req, res) => {
    try {
        const authTokenCookie = req.headers.cookie;
        const authToken = authTokenCookie ? authTokenCookie.split(';')[0].trim().split('=')[1] : null;

        if (!authToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decodedToken = jwt.verify(authToken, process.env.SECRET_TOKEN);
        const { userId } = decodedToken;


        const selectQuery = 'SELECT * FROM files WHERE user_id = ?';
        const [result] = await pool.execute(selectQuery, [userId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        // const file = result[0];
        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const deleteFile = asyncHandler(async (req, res) => {
    try {
        const { fileId } = req.params;

        const selectQuery = 'SELECT * FROM files WHERE id = ?';
        const [result] = await pool.execute(selectQuery, [fileId]);

        if (result.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = result[0];
        const filePath = path.join(__dirname, '../uploads', file.folder_id.toString(), file.filename);

        // Delete physical file
        fs.unlinkSync(filePath);

        // Delete file record from the database
        const deleteQuery = 'DELETE FROM files WHERE id = ?';
        await pool.execute(deleteQuery, [fileId]);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = {
    uploadFile,
    getFileByUser,
    deleteFile
};
