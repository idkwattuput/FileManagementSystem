const asyncHandler = require('express-async-handler');
const pool = require('../config/dbConn');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Get user from the database based on the provided email
        const getUserQuery = 'SELECT * FROM Users WHERE email = ?';
        const [getUserResult] = await pool.query(getUserQuery, [email]);

        // Check if a user with the provided email exists
        if (!getUserResult.length) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = getUserResult[0];

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Passwords match, generate a JWT token for authentication
            const token = jwt.sign({ userId: user.id, email: user.email }, process.env.SECRET_TOKEN, { expiresIn: '1h' });

            // Set the JWT as an HTTP-only cookie
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Set to true in a production environment for secure HTTPS
                maxAge: 3600000, // 1 hour in milliseconds
            });

            return res.json({ message: 'Login successful', token });
        } else {
            // Passwords do not match
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

const logout = asyncHandler(async (req, res) => {
    try {
        // Clear the JWT cookie
        res.clearCookie('access_token');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = {
    login,
    logout
};
