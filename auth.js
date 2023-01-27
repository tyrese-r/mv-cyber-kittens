const bcrypt = require('bcrypt')
const { User } = require('./db')
const jwt = require('jsonwebtoken')

const importantKey = 'foobar'
// Create password hash
const createPassword = async (passwordString) => {
    return await bcrypt.hash(passwordString, 2)
}
// Check password hash
const checkPassword = async (passwordString, passwordHash) => {
    return await bcrypt.compare(passwordString, passwordHash);
}

// Create jwt
const createJWT = async (userId) => {
    const token = jwt.sign({ sub: userId }, importantKey);
    return token;
}


// Verify jwt and get user
const verifyJWTMiddleware = async (req, res, next) => {
    try {
        console.log(req.headers)
        const tokenString = req.headers['authorization'].split('Bearer ')[1];

        console.log(tokenString)
        const decoded = jwt.verify(tokenString, importantKey);
        console.log(decoded)

        const user = await User.findOne({id: decoded.sub})
        req.user = user;
        if(user == null) {
            const error = new Error("Not found")
            error.status = 404
            next(error)
        }
        
        next()
      } catch(err) {
        // err
        req.user = null;
        res.send(401)
        const error = new Error("Unauthorized")
        error.status = 401
        next(error)
      }
}

module.exports = {createPassword, checkPassword, createJWT, verifyJWTMiddleware}