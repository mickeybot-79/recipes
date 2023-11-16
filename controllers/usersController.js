const User = require('../model/User')
const rejectedWords = require('../config/rejectedWords')
const ESrejectedWords = require('../config/ESrejectedWords')
const jwtDecode = require('jwt-decode')
const bcrypt = require('bcrypt')
const { deleteUserLogs } = require('./logsController')

const getUser = async (req, res) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    const token = authHeader.split(' ')[1]
    const decoded = jwtDecode(token)
    const userID = decoded.UserInfo.id
    //if (!req?.params?.id) return res.sendStatus(400) //'message': 'User ID is required.'
    const user = await User.findOne({_id: userID}).exec()
    if (!user) return res.sendStatus(204) //'message': `No users found with that name.`
    res.json(user)
}

const getUserData = async (req, res) => {
    const { userID } = req.body
    //console.log(req.body.userID)
    //if (!req?.body?.userID) return res.sendStatus(400) //'message': 'User ID is required.'
    const user = await User.findOne({username: userID}).exec()
    //console.log(user)
    if (!user) return res.sendStatus(204)
    res.json(user)
}

const getUserPageData = async (req, res) => {
    const { userID } = req.body
    const user = await User.findOne({username: userID}).exec()
    const userToReturn = {
        id: user._id,
        image: user.image,
        country: user.country,
        about: user.about,
        recipes: user.recipes
    }
    res.json(userToReturn)
}

const getTempUserData = async (req, res) => {
    if (!req?.body?.userID) return res.sendStatus(400) //'message': 'User ID is required.'
    const user = await User.findOne({username: req.body.userID}).exec()
    //console.log(user)
    if (!user) {
        res.json({'msg': 'no user'})
    }
    res.json(user)
}

const updateUser = async (req, res) => {
    const { userID } = req.body
    if (!userID) return res.sendStatus(400) //'message': 'User ID is required'
    const foundUser = await User.findOne({_id: userID}).exec()
    if (!foundUser) return res.sendStatus(204) //'message': `No user matches ID ${req.body.id}.`
    const date = new Date()
    const today = date.getTime()
    if (req.body.active === 'false') {
        const result = await User.deleteOne({ _id: userID})
        deleteUserLogs(userID)
        res.json(result)
    }
    if (req.body.image) foundUser.image = req.body.image
    if (req.body.country) foundUser.country = req.body.country
    if (req.body.about) {
        const aboutArray = req.body.about.split(' ')
        const updatedAbout = []
        for (let i = 0; i < aboutArray.length; i++) {
            const wordToCompare = aboutArray[i]
            if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
                updatedAbout.push(wordToCompare)
            }
        }
        foundUser.about = updatedAbout.join(' ')
    }
    if (req.body.pwd) {
        var hashedPwd = await bcrypt.hash(req.body.pwd, 10)
        foundUser.password = hashedPwd
    }
    foundUser.lastUpdated = today
    const result = await foundUser.save()
    res.json(result)
}

const updateFavorite = async (req, res) => {
    if (!req?.body?.userID) return res.sendStatus(400)
    const foundUser = await User.findOne({username: req.body.userID}).exec()
    if (!foundUser) return res.sendStatus(204)
    if (req.body.stat) {
        if (!foundUser.favorites.includes(req.body.recipeID)) {
            foundUser.favorites.push(req.body.recipeID)
        } else {
            foundUser.favorites.splice(foundUser.favorites.indexOf(req.body.recipeID), 1)
        }
    }
    const result = await foundUser.save()
    res.json(result)
}

const getCommentedByUsers = async (req, res) => {
    const { users } = req.body
    const foundUsers = []
    for (let i = 0; i < users.length; i++) {
        const foundUser = await User.findOne({_id: users[i]}).exec()
        if (foundUser) foundUsers.push({id: foundUser._id, username: foundUser.username, image: foundUser.image, isTempUser: foundUser.isTemporary})
    }
    res.json(foundUsers)
}

const getUserWhoPosted = async (req, res) => {
    const { userID } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    if (!foundUser) return res.sendStatus(204)
    const userToReturn = {
        username: foundUser.username,
        isTemporary: foundUser.isTemporary
    }
    res.json(userToReturn)
}

const addCollection = async (req, res) => {
    const { userID, recipeID, collectionIndex } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    if (!foundUser.collections[collectionIndex].recipes.includes(recipeID)) {
        foundUser.collections[collectionIndex].recipes.push(recipeID)
    }
    const result = await foundUser.save()
    res.json(result)
}

const getCollections = async (req, res) => {
    const { userID } = req.body
    const foundUser = await User.findOne({ _id: userID }).exec()
    res.status(200).json({ userCollections: foundUser.collections })
}

const removeFromCollections = async (req, res) => {
    const { recipes, userID, collectionIndex } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    for (let i = 0; i < recipes.length; i++) {
        for (let j = 0; j < foundUser.collections[collectionIndex].recipes.length; j++) {
            if (foundUser.collections[collectionIndex].recipes[j] === recipes[i]) {
                foundUser.collections[collectionIndex].recipes.splice(j, 1)
            }
        }
    }
    await foundUser.save()
    res.sendStatus(200)
}

const createCollection = async (req, res) => {
    const { userID, name, image } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    if (foundUser.collections.length >= 4) {
        res.json({'error': 'limit reached'})
    } else {
        foundUser.collections.push({ name: name, image: image, recipes: []})
        const result = await foundUser.save()
        res.json(result)
    }
}

const deleteCollection = async (req, res) => {
    const {userID, collectionIndex } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    foundUser.collections.splice(collectionIndex, 1)
    const result = await foundUser.save()
    res.json(result)
}

const updateCollection = async (req, res) => {
    const {userID, collectionIndex, name, image } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    if (name) foundUser.collections[collectionIndex].name = name
    if (image)foundUser.collections[collectionIndex].image = image
    const result = await foundUser.save()
    res.json(result)
}

const removeUserRecipe = async (req, res) => {
    const { userID, recipeID } = req.body
    const foundUser = await User.findOne({username: userID}).exec()
    if (!foundUser) return res.sendStatus(204)
    //const recipeToRemove = foundUser.recipes.filter(recipe => recipe === recipeID)
    foundUser.recipes.splice(foundUser.recipes.indexOf(recipeID), 1)
    deleteFavorites(recipeID)
    //deleteFromCollection(recipeID)
    const result = await foundUser.save()
    res.json(result)
}

const addUserRecipe = async (req, res) => {
    const { userID, recipeID } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    if (!foundUser) return res.sendStatus(204)
    foundUser.recipes.push(recipeID)
    const result = await foundUser.save()
    res.json(result)
}

const deleteFavorites = async (recipeID) => { // delete a recipe from favorites on all users, this action might clog the backend!
    const users = await User.find()
    const usersToUpdate = users.filter(user => user.favorites.includes(recipeID))
    for (let i = 0; i < usersToUpdate.length; i++) {
        const foundUser = await User.findOne({_id: usersToUpdate[i]._id}).exec()
        foundUser.favorites.splice(foundUser.favorites.indexOf(recipeID), 1)
        await foundUser.save()
    }
    for (let k = 0; k < users.length; k++) { // delete the recipe from all users' collections
        for (let j = 0; j < users[k].collections.length; j++) {
            if (users[k].collections[j].recipes.includes(recipeID)) {
                const foundUser = await User.findOne({_id: users[k]._id}).exec()
                foundUser.collections[j].recipes.splice(foundUser.collections[j].recipes.indexOf(recipeID), 1)
                await foundUser.save()
            } else {
                console.log(users[k].collections[j].recipes)
            }
        }
    }
}

module.exports = {
    getUser,
    updateUser,
    getUserData,
    getUserPageData,
    updateFavorite,
    getTempUserData,
    getCommentedByUsers,
    getUserWhoPosted,
    addCollection,
    getCollections,
    removeFromCollections,
    createCollection,
    deleteCollection,
    updateCollection,
    removeUserRecipe,
    addUserRecipe
}