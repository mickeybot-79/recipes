const mongoose = require('mongoose')
const Schema = mongoose.Schema

const collectionSchema = new Schema({
    name: String,
    image: String,
    recipes: []
})

const userSchema = new Schema({
    username: String,
    password: String,
    country: String,
    about: String,
    image: String,
    favorites: [],
    collections: [collectionSchema],
    drafts: [],
    recipes: [],
    refreshToken: String,
    active: Boolean,
    createdOn: String,
    lastUpdated: String,
    isTemporary: Boolean,
    tempId: String
})

module.exports = mongoose.model('User', userSchema)