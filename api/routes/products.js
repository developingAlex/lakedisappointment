const express = require('express')
const Product = require('../models/Product')
const authMiddleWare = require('../middleware/auth')
const router = new express.Router()

router.get('/products', authMiddleWare.requireJWT, (req, res) => {
  Product.find()
  .then((products) => {
    res.status(200).json({products})
  })
  .catch((error)=> {
    res.status(400).json({error: error.message}) //if you return the whole error you may be giving away too much information
  })
})

router.post('/products', authMiddleWare.requireJWT, (req, res) => {
  Product.create(req.body)
  .then((newProduct => {
    res.status(201).json({newProduct})
  }))
  .catch((error) => {
    res.status(400).json({error: error.message})
  })

})
module.exports = router