const asyncHandler = require('express-async-handler');
const pool = require('../config/dbConn');
const bcrypt = require('bcrypt')

const getUserById = asyncHandler(async (req, res) => {
    const { user_id } = req.params;

    try {
        const userQuery = 'SELECT * FROM Users WHERE id = ?';
        const [rows] = await pool.query(userQuery, [user_id]);

        if (!rows.length) {
            return res.status(400).json({ message: 'No User On This Id' });
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const register = asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input data
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 7) {
        return res.status(422).json({ message: 'Password must be at least 7 characters long' });
    }

    if (password !== confirmPassword) {
        return res.status(422).json({ message: 'Password and Confirm Password must match' });
    }

    try {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of rounds

        // Check if the email already exists
        const emailExistsQuery = 'SELECT * FROM Users WHERE email = ?';
        const [existingUser] = await pool.query(emailExistsQuery, [email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // If email doesn't exist, proceed to create a new user
        const createUserQuery = 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)';
        const [newUser] = await pool.query(createUserQuery, [name, email, hashedPassword]);

        res.json(newUser[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = {
    getUserById,
    register
};
