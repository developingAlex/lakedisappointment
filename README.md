### Previous exercise 20171204: https://github.com/developingAlex/storms-of-december
# LakeDisappointment 20171206

# App planning
## models:
### Product
- name
- brandName
# Steps to create this app:
1. `mkdir api`
1. `cd api`
1. `yarn init`
1. gives you a package.json file
1. `yarn add express body-parser`
1. add gitignore for node with the vscode plugin
1. create your **server.js** file with boilerplate:
    ```javascript
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
1. add nodemon for development: `yarn add nodemon --dev`
1. add nodemon line to your package.json file to allow running the shortcut `yarn dev` to start your development server:
    ```javascript
    …
    },
      "scripts":{
        "dev": "nodemon server.js"
      }
    ```
1. install mongoose:
    1. `cd api`
    1. `yarn add mongoose`
1. create foler: /api/models
1. create file: /api/models/init.js
1. populate /api/models/init.js with boilerplate:
    ```javascript
    const mongoose = require('mongoose')

    mongoose.Promise = global.Promise

    mongoose.connect(
      'mongodb://localhost/storms',
      { useMongoClient: true }
    )
      .then(() => {
        console.log('successfully connected to database')
      })
      .catch((error) => {
        console.log('Error connecting to MongoDB database', error)
      })

    module.exports = mongoose
    ```
1. 