const Product = require('./Product')

Product.deleteMany()
.then(() => {
  console.log('deleted all products')
  process.exit() //stop from hanging
})