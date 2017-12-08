const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const authMiddleware = require('./middleware/auth')

const server = express()

server.use(bodyParser.json()) //Allows json uploads
server.use(cors()) //allow other origins to contact us ie React frontend
server.use('/', [
  require('./routes/products'), 
  require('./routes/auth'),
  require('./routes/wishlists')
])
server.use(authMiddleware.initialize)
server.listen(7000, (error) => {
  if (error) {
    console.log('Error starting', error)
  }
  else{
    console.log('Server started at http://localhost:7000')
  }
})
