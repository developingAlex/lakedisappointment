const mongoose = require('./init')
const passportLocalMongoose = require('passport-local-mongoose')


const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
})

userSchema.plugin(passportLocalMongoose, {
  userNameField: 'email', //this is the value to sign in with
  userNameLowerCase: true, //ensure that all emails are lowercase
  session: false, //Disable sessions as we'll use JWTs (JSON Web Tokens)
})

module.exports = User