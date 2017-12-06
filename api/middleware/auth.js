const JWT = require('jsonwebtoken')
const User = require('../models/User')
const passport = require('passport')
const jwtSecret = 's9f7ys8d7y9u43tb43i8u02adfYSB#$T'
const jwtAlgorithm = 'HS256'
const jwtExpiresIn = '7 days'
const PassportJwt = require('passport-jwt')


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

passport.use(new PassportJwt.Strategy(
  {
    jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
    algorithms: [jwtAlgorithm]
  },
  //when we have a verified token:
  (payload, done)=>{
    //find the real user from our database using the id in the JWT
    User.findById(payload.sub)
      .then((user) => { //if user was found with this id.
        if(user){
          done(null, user)
        }
        else{ //if no user was found
          done(null, false)
        }
      })
      .catch((error) => {
        //if there was a failure
        done(error, false)
      })
  }))

//instead of spitting back a user this will spit back a jwt token
function signJWTForUser(req,res){
  const user = req.user

  const token = JWT.sign({
    email: user.email
  },
  jwtSecret,
  {
    algorithm: jwtAlgorithm,
    expiresIn: jwtExpiresIn,
    subject: user._id.toString() //this info from https://github.com/auth0/node-jsonwebtoken
  }) //in a real app this would be in an environment variables thing to avoid leaking on github

  res.json({token})
}

module.exports = {
  initialize: passport.initialize(),
  register,
  signJWTForUser,
  requireJWT: passport.authenticate('jwt',{ session: false }),
  signIn: passport.authenticate('local', {session: false})
} //in contrast to previous exercises' code: the curly braces necessary when exporting multiple things.