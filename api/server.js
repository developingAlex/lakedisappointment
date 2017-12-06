const express = require('express')
const bodyParser = require('body-parser')

const server = express()

server.use(bodyParser.json()) //Allows json uploads

server.listen(7000, (error) => {
  if (error) {
    console.log('Error starting', error)
  }
  else{
    console.log('Server started at http://localhost:7000')
  }
})
