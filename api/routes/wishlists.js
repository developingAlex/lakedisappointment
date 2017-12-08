const express = require('express')
const Wishlist = require('../models/Wishlist')
// const authMiddleWare = require('../middleware/auth')
const { requireJWT } = require('../middleware/auth')
const router = new express.Router()

router.get('/wishlist', requireJWT, (req, res) => {
  
  // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
  Wishlist.findOne({user: req.user })
  .populate('products')
  .then((wishlist) => {
    if (wishlist) {
      res.status(200).json({products: wishlist.products})
    }
    else {
      res.status(200).json({products: []})
    }
  })
  .catch((error)=> {
    res.status(500).json({error: error.message}) //if you return the whole error you may be giving away too much information
  })
})


router.post('/wishlist/products/:productID', requireJWT, (req, res) => {
  const { productID } = req.params
  Wishlist.findOneAndUpdate(
    { 
      user: req.user 
    }, 
    {
      //make the changes
      // https://docs.mongodb.com/manual/reference/operator/update/addToSet/
      $addToSet: {products: productID}
    },
    { 
      upsert: true, new:true, runValidators: true //upsert = update and insert
    })
    .populate('products')
    .then((wishlist) => {
      res.json({products: wishlist.products })
    })
    .catch ((error) => {
      res.status(400).json({error: error.message})
    })
})
 
router.delete('/wishlist/products/:productID', requireJWT, (req, res) => {
  const { productID } = req.params
  Wishlist.findOneAndUpdate(
    { 
      user: req.user 
    }, 
    {
      //make the changes
      // https://docs.mongodb.com/manual/reference/operator/update/pull/
      $pull: {products: productID}
    },
    { 
      upsert: true, new:true, runValidators: true //upsert = update and insert
    })
    .populate('products')
    .then((wishlist) => {
      res.json({products: wishlist.products })
    })
    .catch ((error) => {
      res.status(400).json({error: error.message})
    })
})
module.exports = router