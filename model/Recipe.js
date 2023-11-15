const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    content: String,
    userID: String,
    date: String,
    likes: Number,
    likedBy: []
})

const ingredientSchema = new Schema({
    ingredient: String,
    quantity: String,
    unit: String
})

const recipeSchema = new Schema({
        name: String,
        category: String,
        ingredients: [ingredientSchema],
        preparation: [],
        pictures: [],
        cookingTime: String,
        servings: Number,
        createdBy: String,
        createdOn: String,
        lastUpdated: String,
        likes: Number,
        likedBy: [],
        isDraft: Boolean,
        comments: [commentSchema],
        language: String,
        searchField: String
})

module.exports = mongoose.model('Recipe', recipeSchema)