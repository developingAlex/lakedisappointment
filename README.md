### Previous exercise 20171204: https://github.com/developingAlex/storms-of-december
# LakeDisappointment 20171206

# How to run
If you clone this, to run it you have to:
1. `cd api`
1. `yarn install`
1. `yarn seed`
1. Ensure that mongod service is started:
    * on Linux:
        1. verify by executing `ps -aux | grep mong`
        1. start the server by executing `sudo service mongod start`
    * on MacOS:
        1. Check if its running with `brew services list`
        1. ensure the server is running by executing `brew services start mongod`
1. `yarn dev`

# App planning
## models:
### Product
- name
- brandName
# Walkthrough of the steps performed to get authentication working in Node:
1. `mkdir api`
1. `cd api`
1. `yarn init`
1. Gives you a package.json file
1. `yarn add express body-parser`
1. Add gitignore for node with the vscode plugin
1. Create your **server.js** file with boilerplate:
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
1. Add nodemon for development: `yarn add nodemon --dev`
1. Add nodemon line to your package.json file to allow running the shortcut `yarn dev` to start your development server:
    ```javascript
    …
    },
      "scripts":{
        "dev": "nodemon server.js"
      }
    ```
1. Install mongoose:
    1. `cd api`
    1. `yarn add mongoose`
1. Create foler: /api/models
1. Create file: /api/models/init.js
1. Populate /api/models/init.js with boilerplate:
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
1. Plan some models in the readme
1. Create the file for the product: /api/models/Product.js and add initial line from init: `const mongoose = require('./init')`
1. Populate the Product model with its schema, which I got from looking at the code from the previous exercise:
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
1. Think about what other attributes you might want to add to the product, for now we can stick with this to get it up and running.
1. Start on making the seeds file to create some data.
1. First thing to do is make a /api/models/seeds.js file and give it the line to make it aware of our product: `const Product = require('./Product')`
1. Create a /api/models/drop.js file to allow easy wiping during development:
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
1. Create a /api/check/check.http file to experiment with requests against your server:
    ```javascript
    ###
    GET http://localhost:7000/products

    ###
    GET http://localhost:7000/...
    ```
1. Add the line to your server.js file so that it knows about the routes.
    ```javascript
    server.use('/', [require('./routes/products')])
    ```
1. Looking into [passport](https://github.com/agrajm/passport-mongo) for authentication. 
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
      usernameField: 'email', //this is the value to sign in with
      usernameLowerCase: true, //ensure that all emails are lowercase
      session: false, //Disable sessions as we'll use JWTs (JSON Web Tokens)
    })

    const User = mongoose.model('User', userSchema)
    module.exports = User
    ```
1. Now we want to make user registration middleware
1. add an auth.js file to your routes folder and add the express router to it. (copy paste from the products route file)
    ```javascript
    const express = require('express')

    const router = new express.Router()

    module.exports = router
    ```
1. creating a specific file for our auth logic middleware: /api/middleware/auth.js with code:
    ```javascript
    const User = require('../models/User')

    function register(req, res, next) {
        //create a new user model from the submitted data
      const user = new User({
        email: req.body.email,
        firstName: req.body.firstName, 
        lastName: req.body.lastName
      })
      //the below register method comes from the plugin to our User model
      User.register(user, req.body.password, (error, user) => {
        //either a user or an error will come back from this
        if (error) { //our register middleware failed
          next(error)
          return
        }
        //modify the request to add the newly registered user object
        req.user = user
        next()
      })
    }

    module.exports = {
      register
    } //the curly braces necessary when exporting multiple things.
    ```
1. bring it into our /api/routes/auth.js file with `const authMiddleware = require('../middleware/auth')`
    ```javascript
    const express = require('express')
    const User = require('../models/User')
    const authMiddleware = require('../middleware/auth')

    const router = new express.Router()

    router.post('/auth/register', /*user middleware to handle the reg process */
      /*  (req,res) => {}*/
      authMiddleware.register
    )

    module.exports = router
    ```
1. Give your server.js file knowledge of the new route:
    ```javascript
    server.use('/', [require('./routes/products'), require('./routes/auth')])
    ```
1. Test it in the http file with a line like this:
    ```
    ###
    POST http://localhost:7000/auth/register
    Content-Type: application/json

    {
      "email": "user1@mail.com",
      "firstName": "Alphie",
      "lastName": "Bravo",
      "password": "password123"
    }
    ```
    **Note: there cannot be a blank line after the last json key-value pair (before the closing curly brace), or it will see the block as ending before it really does.**

    **Note: the requests must each be separated by three hash/number symbols ###.**
    
    **Note: the blank line before the curly braces block is necessary.**

1. Require in passport in the middleware/auth.js file
    ```javascript
    const passport = require('passport')
    …
    passport.use(User.createStrategy())

    module.exports = {
      register, 
      signIn: passport.authenticate('local', {session: false} )
    }
    ```
1. Add the following to your middleware/auth.js:
    ```javascript
    router.post('/auth',
      authMiddleware.signIn,
      (req,res) => {
        res.json({
          user: req.user
        })
      }
    )
    ```
1. Test it in your check.http file with:
    ```
    ###

    POST http://localhost:7000/auth
    Content-Type: application/json

    {
      "email": "user1@mail.com",
      "password": "password123"
    }
    ```
1. fine so far but if we wanted to allow a session (session: true) ( leave a cookie on the browser ) we need to have the passport initialized:
    **api/middleware/auth.js**
    ```javascript
    module.exports = {
      initialize: passport.initialize(),
      register,
      signIn: passport.authenticate('local', {session: true})
    }
    ```
    **api/server.js**
    ```javascript
    const authMiddleware = require('./middleware/auth')
    …
    server.use(authMiddleware.initialize)
    ```
    **NOTE: in class this broke it so reverted back to session:false**
1. **JWT.io was mentioned in class because its a good resource for what we're doing today**
    ![image from jwt.io](/readme-assets/jwt-screenshot.jpg)
    above: Changing the secret means you will have to change the payload in some way to get it to regenerate and therefore be valid again
1. `cd api`
1. `yarn add jsonwebtoken`
1. /api/middleware/auth.js:
    ```javascript
    const JWT = require('jsonwebtoken')
    …
    //instead of spitting back a user this will spit back a jwt token
    function signJWTForUser(req,res){
      const user = req.user

      const token = JWT.sign({
        email: user.email
      },
      's9f7ys8d7y9u43tb43i8u02adfYSB#$T',
      {
        algorithm: 'HS256',
        expiresIn: '7 days',
        subject: user._id //this info from https://github.com/auth0/node-jsonwebtoken
      }) //in a real app this would be in an environment variables thing to avoid leaking on github
      
      res.json({token})
    }
    …
    module.exports = {
      initialize: passport.initialize(),
      register,
      signJWTForUser,
      signIn: passport.authenticate('local', {session: false})
    }
    ```
1. try using your secret value in the jwt.io site to experiment how it will hash data.
1. You can generate secret keys with such a command: `openssl rand -base64 48`
1. You can then refactor your auth routes to make use of the jwttoken middleware we just made:
    ```javascript
    router.post('/auth/register', /*user middleware to handle the reg process */
      /*  (req,res) => {}*/
      authMiddleware.register,
      authMiddleware.signJWTForUser
    )

    router.post('/auth',
      authMiddleware.signIn, //the next() function for this is whats below: signJWTForUser
      authMiddleware.signJWTForUser
    )
    ```
1. add the functionality to allow sign in based off of jwt tokens instead of username and password:

    `cd api`
    `yarn add passport-jwt`
1. add to api/middleware/auth.js:
    ```javascript
    const PassportJwt = require('passport-jwt')
    …
    passport.use(new PassportJwt.Strategy(
    {
      jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      algorithms: [jwtAlgorithm]
    },
    //when we have a verified token:
    (payload, done)=>{
      //find the real user from our database using the id in the JWT
      User.findById(payload.sub)
        .then((user) => { //if user was found with this id.
          if(user){
            done(null, user)
          }
          else{ //if no user was found
            done(null, false)
          }
        })
        .catch((error) => {
          //if there was a failure
          done(error, false)
        })
    }))
    …
    module.exports = {
      initialize: passport.initialize(),
      register,
      signJWTForUser,
      requireJWT: passport.authenticate('jwt',{ session: false }),
      signIn: passport.authenticate('local', {session: false})
    }
    ```
1. Now that we have that there, how to use it?
1. We can make it so that authentication is required to view the products page:
1. in api/routes/products.js
    ```javascript
    const authMiddleWare = require('../middleware/auth')
    …
    router.get('/products', authMiddleWare.requireJWT, (req, res) => {
    …  
    ```
1. Then you can try to test that authenticating with a token works, by running the POST line in your check.http file with password and email to intially get a token. Then craft another POST line that sends the token as 
    ```
    ###

    GET http://localhost:7000/products
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNTM0ODM1LCJleHAiOjE1MTMxMzk2MzUsInN1YiI6IjVhMjc1MjUyOThlNTc1NWNhZmFiNDgxZCJ9.R5DRPb-gp3JFH1DiN3hzuwyqlGqF5ZFkVubxGVyq6L4
    ```
    **NOTE: in the above there is no new line after 'Bearer'! it is only a space between the end of Bearer and the start of the token code! the text may just look like that because it's wrapping!**

## Moving onto working on the front end - React
1.  ensure your terminal is at the root of your project:
    
    `cd lakedisappointment`

    create a new react-app into the web folder we made earlier:

    `yarn create react-app web`

    
    **Note: we already created a folder called web before we ran the above command**
1.  Create react-app creates a start script which we can copy for our 'dev' convention:
    ```javascript
    "scripts": {
      "start": "react-scripts start",
      "dev": "react-scripts start",
      "build": "react-scripts build",
      "test": "react-scripts test --env=jsdom",
      "eject": "react-scripts eject"
    }    
    ```
1.  Go into app.css and delete everything except text align center for .app
1. Comment out the following line for caching issues in /web/src/index.js
    ```javascript
    ReactDOM.render(<App />, document.getElementById('root'));
    // registerServiceWorker();
    ```
1. Now we can run `yarn dev` to get our server up and running, do this in both the web folder and the api folder, and you'll have both frontend server and backend server running (ensure your mongod is running in the background)
1. strip the standard html from App.js and replace with your own simple
    ```javascript
    ReactDOM.render(<App />, document.getElementById('root'));
    // registerServiceWorker();
    ```
1. Create a file at /web/src/components/SignInForm.js with the following code:
    ```javascript
    import React from 'react'

    function SignInForm({

    }) {
      return (
        <form>
          <label
          
          >
            {'Email: '}
            <input
              type='email'
              name='email'
            />
          </label>
          <label
          
          >
            {'Password: '}
            <input
              type='password'
              name='password'
            />
          </label>

        </form>
      )
    }

    export default SignInForm
    ```
1.  import it in App.js: 
    ```javascript
    import SignInForm from './components/SignInForm'
    ```
1. in index.css we amended it to the following:
    ```javascript
    *{
      margin: 0px;
      padding: 0px;
      box-sizing: border-box;
      font-size: 1rem;
    }

    html{
      font-size: 20px;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: sans-serif;
    }
    ```
1. You can then incorporate the 
    ```javascript
    <SignInForm/>
    ```
1. we want our to make labels fullwidth:
    ```javascript
    label {
      display: block;
    }
    input{
      display: block;
      width: 100%;
    }
    ```
1. we want our to app to not take up the full width of a widescreen so in our App.css file:
    ```javascript
    .App{
    max-width: 30rem;
    margin: auto
    }
    ```
1. Now add a button to the components/SignInForm.js:
    ```html
    <button>
      Sign in
    </button>
    ```
1. And style it from index.css:
    ```css
    button{
      padding: 0.33rem 0.5rem;
      border: none;
      background-color: orange;
    }
    ```
1. add functionality to the button and the form:
1. we want to preserve log(in our browser's console.) stop the form from submitting as the browser normally does, event.preventDefault() in signinform.js
    ```html
    <form
        onSubmit = {(event)=>{
          event.preventDefault()
          console.log('form-submitted', event.target)
        }}>
    ```    
1. at this stage, when you run it in the browser and enter some values into the form then in the console of the browser you can query the page with the following:
    ```
    var form = document.forms[0]
    form.elements.email
    form.elements.password
    form.elements.email.value
    ```
1. To add the same visibility of the values to our submit amend the form tag to the following:
    ```javascript
    <form
      onSubmit = {(event)=>{
        event.preventDefault()
        console.log('form-submitted', event.target)
        const form = event.target
        const elements = form.elements //the key value pairs
        const email = elements.email.value
        const password = elements.password.value
        console.log({email, password})
      }}
    >
    ```
1. 
```javascript

```
1. 
```javascript

```