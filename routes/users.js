const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const verifyAccess = require('../middleware/verifyAccess')

router.route('/commentedBy')
    .post(usersController.getCommentedByUsers)

router.route('/poster')
    .post(usersController.getUserWhoPosted)

router.route('/')
    .post(usersController.getUserData)

router.route('/page')
    .post(usersController.getUserPageData)

router.use(verifyAccess)

router.route('/')
    .get(usersController.getUser)

router.route('/')
    .put(usersController.updateUser)

router.route('/favorite')
    .put(usersController.updateFavorite)

router.route('/collection')
    .post(usersController.createCollection)

router.route('/collection')
    .put(usersController.addCollection)

router.route('/collection')
    .delete(usersController.deleteCollection)

router.route('/collections')
    .put(usersController.getCollections)
    
router.route('/collections')
    .delete(usersController.removeFromCollections)

router.route('/collections')
    .patch(usersController.updateCollection)

router.route('/recipe')
    .delete(usersController.removeUserRecipe)

router.route('/recipe')
    .post(usersController.addUserRecipe)
    
module.exports = router