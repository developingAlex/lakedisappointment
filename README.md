### Previous exercise 20171204: https://github.com/developingAlex/storms-of-december
# LakeDisappointment 20171206

# To run
If you clone this to run you have to:
1. `cd api`
1. `yarn install`
1. `yarn seed`
1. ensure that mongodb service is started
    * on Linux:
        1. verify by executing `ps -aux | grep mong`
        1. start the server by executing `sudo service mongod start`
    * on iOS:
        1. Check if its running with `brew services list`
        1. ensure the server is running by executing `brew services start mongod`
1. `yarn dev`

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
1. plan some models in the readme
1. create the file for the product: /api/models/Product.js and add initial line from init: `const mongoose = require('./init')`
1. populate the Product model with its schema, which I got from looking at the code from the previous exercise:
    ```javascript
    const mongoose = require('./init')

    const Product = mongoose.model('Product', {
      brandName: {
        type: String, 
        required: [true, 'Brand Name is required']
      },
      name: {
        type: String,
        required: [true, 'Name is required']
      }
    })

    module.exports = Product
    ```
1. think about what other attributes you might want to add to the product, for now we can stick with this to get it up and running.
1. start on making the seeds file to create some data.
1. first thing to do is make a /api/models/seeds.js file and give it the line to make it aware of our product: `const Product = require('./Product')`
1. create a /api/models/drop.js file to allow easy wiping during development:
    ```javascript
    const Product = require('./Product')

    Product.deleteMany()
    .then(() => {
      console.log('deleted all products')
      process.exit() //stop from hanging
    })
    ```
    Then add a script for it so it runs when you run `yarn drop`:
    ```javascript
    },
      "scripts": {
        "dev": "nodemon server.js",
        "drop": "node models/drop.js"
      }
    ```
1. Add other useful scripts:
    ```javascript
    },
      "scripts": {
        "dev": "nodemon server.js",
        "drop": "node models/drop.js",
        "seed": "node models/seeds.js",
        "reset": "npm run drop && npm run seed"
      }
    ```
    **NOTE: in the above for the reset script its there as npm instead of yarn because they are interchangeable and yarn is frequently not available on a production server**
1. Establish some routes, make a /api/routes/products.js file
    ```javascript
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
    ```
    **NOTE: if you return entire error objects you may be giving away more information that you need to**
1. create a /api/check/check.http file to experiment with requests against your server:
    ```javascript
    ###
    GET http://localhost:7000/products

    ###
    GET http://localhost:7000/...
    ```
1. add the line to your server.js file so that it knows about the routes.
    ```javascript
    server.use('/', [require('./routes/products')])
    ```
1. looking into [passport](https://github.com/agrajm/passport-mongo) for authentication. 
    1. `cd api`
    1. `yarn add passport passport-local passport-local-mongoose`
1. Going to the create the user model next:
    ```javascript
    const mongoose = require('./init')

    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String
    })

    module.exports = User
    ```
1. Analogous to adding devise to the user model back in Rails, do this to add passport to our user model:
    ```javascript
    const passportLocalMongoose = require('passport-local-mongoose')
    …
    userSchema.plugin(passportLocalMongoose, {
      userNameField: 'email', //this is the value to sign in with
      userNameLowerCase: true, //ensure that all emails are lowercase
      session: false, //Disable sessions as we'll use JWTs (JSON Web Tokens)
    })
    ```
1. add an auth.js file to your routes folder and add the express router to it. (copy paste from the products route file)
    ```javascript
    const express = require('express')
    const User = require('../models/User')

    const router = new express.Router()

    module.exports = router
    ```
1. 