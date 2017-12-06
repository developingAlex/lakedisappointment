const express = require('express')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()

router.post('/auth/register', /*user middleware to handle the reg process */
  /*  (req,res) => {}*/
  authMiddleware.register,
  (req,res) => {
    res.json({
      user: req.user
    })
  }
)

module.exports = router