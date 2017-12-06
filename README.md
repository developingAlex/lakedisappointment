mkdir api
cd into api
yarn init
gives you a package.json file
`yarn add express body-parser`
add gitignore for node with the vscode plugin
create your server.js file with boilerplate:
```
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

```
add nodemon for development: `yarn add nodemon --dev`
add nodemon line to your package.json file:
```
…
},
  "scripts":{
    "dev": "nodemon server.js"
  }
```
