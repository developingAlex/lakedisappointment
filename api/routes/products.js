const express = require('express')
const Product = require('../models/Product')

const router = new express.Router()

router.get('/products', (req, res) => {
  Product.find()
  .then((products) => {
    res.status(200).json({products})
  })
  .catch((error)=> {
    res.status(400).json({error: error.message}) //if you return the whole error you may be giving away too much information
  })
})

module.exports = router