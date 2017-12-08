const mongoose = require('./init')
const Schema = mongoose.Schema

// similar to :
// t.references :owner, foreign_key: {to_table: :users}
//what comes after the .model in the below line, is the schema.

const Wishlist = mongoose.model('Wishlist', {
  user: { type: Schema.ObjectId, ref: 'User', unique: true },
  //unique true so that each user will only have ONE wishlist.
  //one wishlist will have multiple products, we do that by wrapping it in square brackets
  products: [{type: Schema.ObjectId, ref: 'Product'}],
  name: String
})

module.exports = Wishlist