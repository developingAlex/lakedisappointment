const express = require('express')
const Wishlist = require('../models/Wishlist')
// const authMiddleWare = require('../middleware/auth')
const { requireJWT } = require('../middleware/auth')
const router = new express.Router()

router.get('/wishlist', requireJWT, (req, res) => {
  
  // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
  Wishlist.findOne({user: req.user })
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

 
module.exports = router