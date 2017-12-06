const mongoose = require('./init')

const Product = mongoose.model('Product', {
  brandName: {
    type: String, 
    required: [true, 'Brand Name is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  }
})

module.exports = Product