const jwt = require('jsonwebtoken')

const verifyAccess = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401)
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({'error': err})
            req.user = decoded.UserInfo.username
            req.id = decoded.UserInfo._id,
            req.lastUpdated = decoded.UserInfo.lastUpdated
            if (decoded.UserInfo.isTemporary) req.isTemporary = decoded.UserInfo.isTemporary
            next()
        }
    )
}

module.exports = verifyAccess