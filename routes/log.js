const express = require('express')
const router = express.Router()
const logsController = require('../controllers/logsController')

router.route('/')
    .post(logsController.handleLogEntries)

router.route('/get')
    .post(logsController.getLogs)

router.route('/')
    .delete(logsController.removeRecipeLogs)

router.route('/entry')
    .delete(logsController.deleteLogEntry)

module.exports = router