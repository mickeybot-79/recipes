const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.handleNewUser)

router.post('/', authController.handleLogin)

router.get('/refresh', authController.handleRefreshToken)

router.post('/logout', authController.handleLogout)

router.post('/verify', authController.verifyUsername)

module.exports = router