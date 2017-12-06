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

module.exports = {
  register,
  signIn: passport.authenticate('local', {session: false})
} //in contrast to previous exercises' code: the curly braces necessary when exporting multiple things.