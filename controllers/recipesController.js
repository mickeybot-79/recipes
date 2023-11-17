const Recipe = require('../model/Recipe')
const User = require('../model/User')
const rejectedWords = require('../config/rejectedWords')
const ESrejectedWords = require('../config/ESrejectedWords')

const getRecipes = async (req, res) => {
    const recipes = await Recipe.find()
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    if (!req.body.recipes) {
        res.json(recipes)
    } else {
        const recipesToReturn = []
        for (let i = 0; i < req.body.recipes.length; i++)  {
            //recipesToReturn.push(await Recipe.findOne({ _id: req.body.recipes[i] }).exec())
            recipesToReturn.push(recipes.filter(recipe => recipe._id.toString() === req.body.recipes[i]))
        }
        res.json(recipesToReturn)
    }
}

const getRecipesByName = async (req, res) => {
    const { name, slice, lng } = req.body
    const recipes = await Recipe.find()
    const lngRecipes = recipes.filter(recipe => recipe.language === lng)
    const result = lngRecipes.filter(recipe => recipe.name.toLowerCase().search(name.toLowerCase()) !== -1)
    if (!result) return res.sendStatus(204) //'message': 'No recipes found with that name.'
    const slicedResult = result.slice(0, slice)
    res.json({'result': slicedResult, 'limit': result.length})
}

const getRecipesByIngredients = async (req, res) => {
    const { ingredients, slice, lng } = req.body
    const recipes = await Recipe.find()
    const lngRecipes = recipes.filter(recipe => recipe.language === lng)
    //if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const result = []
    for (let i = 0; i < lngRecipes.length; i++) {
        for (let j = 0; j < lngRecipes[i].ingredients.length; j++) {
            for (let k = 0; k < ingredients.length; k++) {
                if (!lngRecipes[i].ingredients[j].ingredient.toLowerCase().includes(ingredients[k].toLowerCase())) {
                    break
                } else {
                    if (!result.includes(lngRecipes[i])) {
                        result.push(lngRecipes[i])
                    } else {
                        break
                    }
                }
            }
        }
    }
    if (result.length === 0) return res.sendStatus(204) //'message': 'No recipes found with that ingredient / those ingredients.'
    const slicedResult = result.slice(0, slice)
    res.json({'result': slicedResult, 'limit': result.length})
}

const getRecipesByCategory = async (req, res) => {
    const { category, slice, lng } = req.body
    const recipes = await Recipe.find()
    const lngRecipes = recipes.filter(recipe => recipe.language === lng)
    const result = lngRecipes.filter(recipe => recipe.category.toLowerCase().search(category.toLowerCase()) !== -1)
    if (!result) return res.sendStatus(204) //'message': 'No recipes found with that category.'
    const slicedResult = result.slice(0, slice)
    res.json({'result': slicedResult, 'limit': result.length})
}

const getMyRecipes = async (req, res) => {
    const recipes = await Recipe.find()
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const result = recipes.filter(recipe => recipe.createdBy === req.body.user)
    if (!result) return res.sendStatus(204) //'message': 'You still have not created any recipes. Would you like to start?'
    res.json(result)
}

const getMyRecipesByName = async (req, res) => {
    const recipes = await Recipe.find()
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const filteredRecipes = recipes.filter(recipe => recipe.createdBy === req.body.user)
    if (!filteredRecipes) return res.sendStatus(204) //'message': 'You still have not created any recipes. Would you like to start?'
    const result = filteredRecipes.filter(recipe => recipe.name.split(' ').includes(req.body.name))
    if (!result) return res.sendStatus(204) //'message': 'No recipes found with that name.'
    res.json(result)
}

const getMyRecipesByIngredients = async (req, res) => {
    const recipes = await Recipe.find()
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const filteredRecipes = recipes.filter(recipe => recipe.createdBy === req.body.user)
    if (!filteredRecipes) return res.sendStatus(204) //'message': 'You still have not created any recipes. Would you like to start?'
    const result = []
    for (let i = 0; i < filteredRecipes.length; i++) {
        for (let j = 0; j < req.body.ingredients.length; j++) {
            if (filteredRecipes[i].ingredients.includes(req.body.ingredients[j])) {
                result.push(filteredRecipes[i])
            }
        }
    }
    res.json(result)
}

const getMyRecipesByCategory = async (req, res) => {
    const recipes = await Recipe.find()
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const filteredRecipes = recipes.filter(recipe => recipe.createdBy === req.body.user)
    if (!filteredRecipes) return res.sendStatus(204) //'message': 'You still have not created any recipes. Would you like to start?'
    const result = filteredRecipes.filter(recipe => recipe.category === req.body.category)
    if (!result) return res.sendStatus(204) //'message': 'No recipes found with that category.'
    res.json(result)
}

const getRecipe = async (req, res) => {
    if (!req?.body?.id) return res.sendStatus(400) //'message': 'Recipe ID is required.'
    const recipe = await Recipe.findOne({ searchField: req.body.id }).exec()
    if (!recipe) return res.sendStatus(204) //'message': `No recipes found with that name.`
    const originalLength = recipe.comments.length
    recipe.comments.splice(0, (recipe.comments.length - parseInt(req.body.commentsSlice)))
    res.json({ 'recipe': recipe, 'commentLength': originalLength })
}

const createNewRecipe = async (req, res) => {
    const duplicate = await Recipe.findOne({ name: req.body.name }).exec()
    if (duplicate) return res.sendStatus(400)
    const nameArray = req.body.name.split(' ')
    const updatedName = []
    for (let i = 0; i < nameArray.length; i++) {
        const wordToCompare = nameArray[i]
        if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
            updatedName.push(wordToCompare)
        }
    }
    const finalIngredients = req.body.ingredients
    const updatedIngredients = []
    for (let i = 0; i < finalIngredients.length; i++) {
        const currentIngredient = finalIngredients[i].ingredient
        const updatedIngredient = []
        for (let j = 0; j < currentIngredient.split(' ').length; j++) {
            const wordToCompare = currentIngredient.split(' ')[j]
            if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
                updatedIngredient.push(wordToCompare)
            }
        }
        updatedIngredients.push({
            ingredient: updatedIngredient.join(' '),
            quantity: finalIngredients[i].quantity,
            unit: finalIngredients[i].unit
        })
    }
    const preparationArray = req.body.preparation
    const updatedPreparation = []
    for (let i = 0; i < preparationArray.length; i++) {
        const currentStep = preparationArray[i]
        const updatedStep = []
        for (let j = 0; j < currentStep.split(' ').length; j++) {
            const wordToCompare = currentStep.split(' ')[j]
            if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
                updatedStep.push(wordToCompare)
            }
        }
        updatedPreparation.push(updatedStep.join(' '))
    }
    const date = new Date()
    const today = date.getTime()
    try {
        const result = await Recipe.create({
            name: updatedName.join(' '),
            category: req.body.category,
            ingredients: [...updatedIngredients],
            preparation: updatedPreparation,
            cookingTime: req.body.cookingTime,
            servings: req.body.servings,
            pictures: req.body.pictures,
            createdBy: req.body.user || 'Anonymous',
            createdOn: today,
            lastUpdated: today,
            likes: 0,
            comments: [],
            language: req.body.lng,
            searchField: updatedName.join('-')
        })
        res.status(201).json(result)
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const updateRecipeData = async (req, res) => {
    const { id, name, category, ingredients, preparation, cookingTime, servings, pictures } = req.body
    const recipe = await Recipe.findOne({ _id: id }).exec()
    if (!recipe) return res.sendStatus(404)

    const nameArray = name.split(' ')
    const updatedName = []
    for (let i = 0; i < nameArray.length; i++) {
        const wordToCompare = nameArray[i]
        if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
            updatedName.push(wordToCompare)
        }
    }
    const finalIngredients = ingredients
    const updatedIngredients = []
    for (let i = 0; i < finalIngredients.length; i++) {
        const currentIngredient = finalIngredients[i].ingredient
        const updatedIngredient = []
        for (let j = 0; j < currentIngredient.split(' ').length; j++) {
            const wordToCompare = currentIngredient.split(' ')[j]
            if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
                updatedIngredient.push(wordToCompare)
            }
        }
        updatedIngredients.push({
            ingredient: updatedIngredient.join(' '),
            quantity: finalIngredients[i].quantity,
            unit: finalIngredients[i].unit
        })
    }
    const preparationArray = preparation
    const updatedPreparation = []
    for (let i = 0; i < preparationArray.length; i++) {
        const currentStep = preparationArray[i]
        const updatedStep = []
        for (let j = 0; j < currentStep.split(' ').length; j++) {
            const wordToCompare = currentStep.split(' ')[j]
            if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
                updatedStep.push(wordToCompare)
            }
        }
        updatedPreparation.push(updatedStep.join(' '))
    }

    const date = new Date()
    const today = date.getTime()
    recipe.name = updatedName.join(' ')
    recipe.category = category
    recipe.ingredients = [...updatedIngredients]
    recipe.preparation = updatedPreparation
    recipe.cookingTime = cookingTime
    recipe.servings = servings
    recipe.pictures = pictures
    recipe.lastUpdated = today
    try {
        const result = await recipe.save()
        res.json(result)
    } catch (err) {
        res.status(500).json({ 'message': err.message })
    }
}

const updateRecipeStats = async (req, res) => {
    if (!req?.body?.id) return res.sendStatus(400) //'message': 'Recipe ID is required'
    const recipe = await Recipe.findOne({ _id: req.body.id }).exec()
    if (!recipe) return res.sendStatus(204) //'message': `No recipe matches ID ${req.body.id}.`
    if (req.body.stat === 'like') {
        if (!recipe.likedBy.includes(req.body.userID)) {
            recipe.likes += 1
            recipe.likedBy.push(req.body.userID)
        } else {
            recipe.likes -= 1
            recipe.likedBy.splice(recipe.likedBy.indexOf(req.body.userID), 1)
        }
    }
    if (req.body.stat !== 'like') { // received comment
        const date = new Date()
        const today = date.getTime()
        recipe.comments.push({
            content: req.body.stat,
            userID: req.body.userID,
            date: today,
            likes: 0
        })
    }
    const result = await recipe.save()
    //console.log(result)
    res.json(result)
}

const likeComment = async (req, res) => {
    const { recipeID, commentID, userID } = req.body
    //console.log(commentID)
    const recipe = await Recipe.findOne({ _id: recipeID }).exec()
    const selectedComment = recipe.comments.filter(comment => comment._id.toString() === commentID)
    //console.log(selectedComment[0])
    const realIndex = recipe.comments.indexOf(selectedComment[0])
    if (!recipe.comments[realIndex].likedBy.includes(userID)) {
        try {
            recipe.comments[realIndex].likes += 1
            recipe.comments[realIndex].likedBy.push(userID)
        } catch {
            try {
                recipe.comments[realIndex].likes += 1
                recipe.comments[realIndex].likedBy.push(userID)
            } catch (err) {
                console.log(err)
            }
        }
    } else {
        try {
            recipe.comments[realIndex].likes -= 1
            recipe.comments[realIndex].likedBy.splice(recipe.comments[realIndex].likedBy.indexOf(userID), 1)
        } catch {
            try {
                recipe.comments[realIndex].likes -= 1
                recipe.comments[realIndex].likedBy.splice(recipe.comments[realIndex].likedBy.indexOf(userID), 1)
            } catch (err) {
                console.log(err)
            }
        }
    }
    const result = await recipe.save()
    res.json(result)
}

const deleteComment = async (req, res) => {
    const { recipeID, commentID, userID } = req.body
    const recipe = await Recipe.findOne({ _id: recipeID }).exec()
    const foundComment = recipe.comments.filter(comment => comment._id.toString() === commentID)
    if (!foundComment) res.sendStatus(404)
    recipe.comments.splice(recipe.comments.indexOf(foundComment[0]), 1)
    const result = await recipe.save()
    res.json(result)
}

const deleteRecipe = async (req, res) => {
    if (!req?.body?.id) return res.sendStatus(400) //'message': 'Employee ID required.'
    const recipe = await Recipe.findOne({ _id: req.body.id }).exec()
    if (!recipe) return res.sendStatus(204) //'message': `No employee matches ID ${req.body.id}.`
    if (recipe.createdBy !== req.body.userID) return res.sendStatus(403) //'message': 'You cannot delete this recipe.'
    const result = await Recipe.deleteOne({ _id: req.body.id })
    res.json(result)
}

const getComments = async (req, res) => {
    const { recipeID, commentsSlice } = req.body
    const recipe = await Recipe.findOne({ _id: recipeID }).exec()
    if (!recipe) return res.sendStatus(204)
    recipe.comments.splice((commentsSlice - 10), (recipe.comments.length - parseInt(commentsSlice)))
    res.json(recipe.comments)
}

const getUserRecipes = async (req, res) => {
    const { userID } = req.body
    //console.log('userID: ', userID)
    const recipes = await Recipe.find()
    // const foundUser = await User.findOne({username: userID}).exec()
    // console.log(foundUser)
    const userRecipes = recipes.filter(recipe => recipe.createdBy === userID)
    //console.log(userID)
    res.json(userRecipes)
}

const getBestRecipes = async (req, res) => {
    const { lng } = req.body
    const recipes = await Recipe.find()
    const lngRecipes = recipes.filter(recipe => recipe.language === lng)
    const bestRecipes = lngRecipes.sort((a, b) => b.likes - a.likes).slice(0, 20)
    res.json(bestRecipes)
}

const getNewestRecipes = async (req, res) => {
    const { lng } = req.body
    const recipes = await Recipe.find()
    const lngRecipes = recipes.filter(recipe => recipe.language === lng)
    const newestRecipes = lngRecipes.sort((a, b) => b.createdOn - a.createdOn).slice(0, 20)
    res.json(newestRecipes)
}

const getMyFavoriteRecipes = async (req, res) => {
    const { userID } = req.body
    const foundUser = await User.findOne({_id: userID}).exec()
    const userFavorites = []
    for (let i = 0; i < foundUser.favorites.length; i++) {
        const recipe = await Recipe.findOne({ _id: foundUser.favorites[i] }).exec()
        if (recipe && !userFavorites.includes(recipe)) userFavorites.push(recipe)
    }
    res.json(userFavorites)
}

const getCollectionRecipesData = async (req, res) => {
    const { recipes } = req.body
    if (!recipes) return res.sendStatus(204) //'message': 'No recipes found.'
    const allRecipes = []
    for (let i = 0; i < recipes.length; i++) {
        const currentRecipe = await Recipe.findOne({_id: recipes[i]})
        allRecipes.push({
            _id: currentRecipe._id,
            name: currentRecipe.name,
            pictures: currentRecipe.pictures,
            searchField: currentRecipe.searchField
        })
    }
    if (!allRecipes.length) return res.sendStatus(204) //'message': 'You still have not created any recipes. Would you like to start?'
    res.json(allRecipes)
}

module.exports = {
    getRecipes,
    getRecipesByName,
    getRecipesByIngredients,
    getRecipesByCategory,
    getMyRecipes,
    getMyRecipesByName,
    getMyRecipesByIngredients,
    getMyRecipesByCategory,
    getRecipe,
    createNewRecipe,
    updateRecipeData,
    updateRecipeStats,
    deleteRecipe,
    likeComment,
    deleteComment,
    getComments,
    getUserRecipes,
    getBestRecipes,
    getNewestRecipes,
    getMyFavoriteRecipes,
    getCollectionRecipesData
}
