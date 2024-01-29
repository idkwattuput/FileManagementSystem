const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController')

router.route('/login')
    .post(authController.login)

router.post('/logout', authController.logout);

module.exports = router