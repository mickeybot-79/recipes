const User = require('../model/User')
const Recipe = require('../model/Recipe')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const rejectedWords = require('../config/rejectedWords')
const ESrejectedWords = require('../config/ESrejectedWords')

const handleNewUser = async (req, res) => {
    const { user, pwd, country, about, image, tempId } = req.body
    if (!user) return res.sendStatus(400) //'message': 'Username and password are required.'
    if (rejectedWords.includes(user.toLowerCase()) || ESrejectedWords.includes(user.toLowerCase())) {
        res.status(401).json({'error': 'username contains forbidden words'})
    }
    const aboutArray = about.split(' ')
    const updatedAbout = []
    for (let i = 0; i < aboutArray.length; i++) {
        const wordToCompare = aboutArray[i]
        if (!rejectedWords.includes(wordToCompare.toLowerCase()) && !ESrejectedWords.includes(wordToCompare.toLowerCase())) {
            updatedAbout.push(wordToCompare)
        }
    }
    const duplicate = await User.findOne({ username: user }).exec()
    if (duplicate) return res.sendStatus(409) //'error': `User ${user} already exists.`
    try {
        if (pwd) var hashedPwd = await bcrypt.hash(pwd, 10)
        const date = new Date()
        const today = date.getTime()
        const result = await User.create({
            "username": user,
            "password": hashedPwd,
            "createdOn": today,
            "lastUpdated": today,
            "country": country,
            "about": updatedAbout.join(' '),
            "image": image,
            "tempId": tempId ? tempId : '',
            "favorites": [],
            "collections": [],
            "drafts": [],
            "refreshToken": '',
            "active": true,
            "isTemporary": pwd ? false : true
        })
        const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "id": foundUser._id,
                "lastUpdated": foundUser.lastUpdated,
                "isTemporary": foundUser.isTemporary
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
        )
        //res.json({ accessToken })
        res.status(201).json({'user': result, 'accessToken': accessToken}) //'success': `New user ${user} created!`
    } catch (err) {
        res.status(500).json({'message': err.message})
    }
}

const handleLogin = async (req,res) => {
    const { user, pwd } = req.body
    if (!user || !pwd) return res.sendStatus(400) //'message': 'Username and password are required.'
    const foundUser = await User.findOne({ username: user }).exec()
    if (!foundUser) return res.sendStatus(401) //'error': 'Incorrect Username or password'
    const match = await bcrypt.compare(pwd, foundUser.password)
    if (match) {
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "id": foundUser._id,
                    "lastUpdated": foundUser.lastUpdated
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '30m' }
        )
        const refreshToken = jwt.sign(
            { "username": foundUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '90d' }
        )
        foundUser.refreshToken = refreshToken
        await foundUser.save()
        res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000  * 90, sameSite: 'None', secure: true})
        res.json({ accessToken })
    } else {
        res.sendStatus(401) //'error': 'Incorrect Username or password'
    }
}

const handleRefreshToken = async (req,res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(401)
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec()
    if (!foundUser) return res.sendStatus(403) //'error': 'User not found'
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || foundUser.username !== decoded.username) return res.status(403).json({'error': err})
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "id": foundUser._id,
                        "lastUpdated": foundUser.lastUpdated
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            )
            res.json({ accessToken })
        }
    )
}

const handleLogout = async (req,res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec()
    if (!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure:true})
        return res.sendStatus(204)
    }    
    foundUser.refreshToken = ''
    await foundUser.save()
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure:true})
    res.sendStatus(204)
}

const handleTempLogin = async (req,res) => {
    const { userID } = req.body
    if (!userID) return res.sendStatus(400) //'message': 'Username and password are required.'
    const foundUser = await User.findOne({ _id: userID }).exec()
    if (!foundUser) return res.sendStatus(401) //'error': 'Incorrect Username or password'
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "id": foundUser._id,
                "lastUpdated": foundUser.lastUpdated,
                "isTemporary": foundUser.isTemporary
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    )
    //await foundUser.save()
    res.json({ accessToken })
}

const verifyUsername = async (req,res) => {
    const { username, tempId } = req.body
    const foundUser = await User.findOne({ username: username }).exec()
    if (!foundUser) return res.sendStatus(404)
    if (foundUser.tempId === tempId) {
        res.json({ 'match': 'true' })
    } else {
        const recipes = await Recipe.find()
        const recipesToSend = recipes.filter(recipe => recipe.createdBy !== foundUser._id).slice(0, 4)
        const extraRecipe = recipes.filter(recipe => recipe.createdBy === foundUser._id.toString()).slice(0, 1)
        if (!recipesToSend.includes(extraRecipe[0])) recipesToSend.push(extraRecipe[0])
        //console.log(foundUser._id)
        res.json({ 'match': 'false', 'recipes': recipesToSend, foundUserID: foundUser._id.toString() })
    }
}

module.exports = { 
    handleNewUser,
    handleLogin,
    handleRefreshToken,
    handleLogout,
    handleTempLogin,
    verifyUsername
}
