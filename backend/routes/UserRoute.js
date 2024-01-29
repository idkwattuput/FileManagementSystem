const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserController')

router.route('/')
    .post(userController.register)

router.route('/:user_id')
    .get(userController.getUserById)

module.exports = router