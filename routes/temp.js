const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const usersController = require('../controllers/usersController')

router.route('/')
    .post(authController.handleTempLogin)

router.route('/user')
    .put(usersController.getTempUserData)

module.exports = router