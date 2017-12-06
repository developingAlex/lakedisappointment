const express = require('express')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()

router.post('/auth/register', /*user middleware to handle the reg process */
  /*  (req,res) => {}*/
  authMiddleware.register,
  authMiddleware.signJWTForUser
)

router.post('/auth',
  authMiddleware.signIn, //the next() function for this is whats below: signJWTForUser
  authMiddleware.signJWTForUser
)

module.exports = router