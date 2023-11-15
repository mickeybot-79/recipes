const express = require('express')
const router = express.Router()
const recipesController = require('../controllers/recipesController')
const verifyAccess = require('../middleware/verifyAccess')

router.use(verifyAccess)

router.route('/')
    .get(recipesController.getMyRecipes)

router.route('/name')
    .post(recipesController.getMyRecipesByName)

router.route('/ingredients')
    .post(recipesController.getMyRecipesByIngredients)

router.route('/category')
    .post(recipesController.getMyRecipesByCategory)

// router.route('/')
//     .put(recipesController.updateRecipe)

router.route('/')
    .delete(recipesController.deleteRecipe)

module.exports = router