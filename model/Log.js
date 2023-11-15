const mongoose = require('mongoose')
const Schema = mongoose.Schema

const logsSchema = new Schema({
    timestamp: String,
    activity: String,
    recipeID: String,
    userID: String
})

module.exports = mongoose.model('Logs', logsSchema)