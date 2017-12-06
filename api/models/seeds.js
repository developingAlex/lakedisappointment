const Product = require('./Product')

Product.create([
  {
    brandName: 'Colgate',
    name: 'Toothpaste'
  },{
    brandName: 'Kraft',
    name: 'Peanut Butter'
  },{
    brandName: 'Yates',
    name: 'Grass Seeds 500g'
  }
])
.then((products) => {
  console.log('created products', products)
})
.catch ((error) => {
  console.error(error)
})