const express = require('express')
const router = express.Router()
const recipesController = require('../controllers/recipesController')

router.route('/')
    .get(recipesController.getRecipes)

router.route('/best')
    .post(recipesController.getBestRecipes)

router.route('/newest')
    .post(recipesController.getNewestRecipes)

router.route('/')
    .post(recipesController.getRecipes)

router.route('/')
    .put(recipesController.updateRecipeStats)

router.route('/update')
    .put(recipesController.updateRecipeData)

router.route('/user')
    .post(recipesController.getUserRecipes)

router.route('/recipe')
    .post(recipesController.getRecipe)

router.route('/name')
    .post(recipesController.getRecipesByName)

router.route('/ingredients')
    .post(recipesController.getRecipesByIngredients)

router.route('/category')
    .post(recipesController.getRecipesByCategory)

router.route('/new')
    .post(recipesController.createNewRecipe)

router.route('/comment')
    .put(recipesController.likeComment)

router.route('/comment')
    .delete(recipesController.deleteComment)

router.route('/comments')
    .post(recipesController.getComments)

router.route('/favorites')
    .post(recipesController.getMyFavoriteRecipes)

router.route('/collections')
    .post(recipesController.getCollectionRecipesData)

module.exports = router