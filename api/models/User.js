const mongoose = require('./init')

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String
})

module.exports = User