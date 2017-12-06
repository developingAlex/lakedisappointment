const JWT = require('jsonwebtoken')
const User = require('../models/User')
const passport = require('passport')

passport.use(User.createStrategy())
function register(req, res, next) {
    //create a new user model from the submitted data
   const user = new User({
     email: req.body.email,
     firstName: req.body.firstName, 
     lastName: req.body.lastName
   })
   //the below register method comes from the plugin to our User model
   User.register(user, req.body.password, (error, user) => {
    //either a user or an error will come back from this
    if (error) { //our register middleware failed
      next(error)
      return
    }
    //modify the request to add the newly registered user object
    req.user = user
    next()
   })
}

//instead of spitting back a user this will spit back a jwt token
function signJWTForUser(req,res){
  const user = req.user

  const token = JWT.sign({
    email: user.email
  },
  's9f7ys8d7y9u43tb43i8u02adfYSB#$T',
  {
    algorithm: 'HS256',
    expiresIn: '7 days',
    subject: user._id //this info from https://github.com/auth0/node-jsonwebtoken
  }) //in a real app this would be in an environment variables thing to avoid leaking on github
  
  res.json({token})
}

module.exports = {
  initialize: passport.initialize(),
  register,
  signIn: passport.authenticate('local', {session: false})
} //in contrast to previous exercises' code: the curly braces necessary when exporting multiple things.