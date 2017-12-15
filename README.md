# LakeDisappointment 20171206
### Previous exercise 20171204: https://github.com/developingAlex/storms-of-december
### Part of a series of exercises learning languages
[See the contents page](https://github.com/developingAlex/contents) for links to other exercises and what they covered

# Contents
* [How to run - get up and running with a freshly cloned copy of this repo](#how-to-run)
* [Initial App planning](#app-planning)
* [Walkthrough of the steps performed to get authentication working in Node](#walkthrough-of-the-steps-performed-to-get-authentication-working-in-node)
* [Moving onto working on the front end - React](#moving-onto-working-on-the-front-end---react)
* [Challenges](#challenges)
* [MongoError: E11000 duplicate key](#steps-ive-taken-and-struggles-to-implement-the-challenges)
* Instructors solutions to the challenges
    * [listing the products](#listing-the-products)
    * [form to create new products](#form-to-create-new-products)
    * [updating a product](#updating-a-product)
    * [doing the edit form for updating products](#doing-the-edit-form-for-updating-products)
    * [make a wishlist functionality](#following-along-to-make-a-wishlist-functionality-where-users-can-maintain-a-wishlist-of-products-demonstrates-how-to-manage-database-relationships)
* [20171212 - Follow along in class demonstrating routing](#20171212---follow-along-in-class-demonstrating-routing-with-different-urls-in-reactjs)
* [20171213 - continuing on from above](#20171213---continuing-on-from-above)
* [Deployment steps](#deployment-steps)

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
1. If there are any lines in the source code that look like `process.env.MONGO_URI` for example, particularly the `process.env` part, then it means some environment variables have been deployed, and they won't have been pushed to github so you won't have a copy of them. You'll have to create a file in your backend /api folder called .env (and production.env if you're to be deploying online) and here is an example of what the contents would be for dev:
    * `MONGO_URI = mongodb://localhost/yarra`

        Where 'yarra' is the name your using for your mongo database

        **Note**: in the below code, you'll see parts where I have storms instead (I should have changed that at the start as that was a prior project so just bear that in mind, if you're starting from scratch you can go with whatever)
    * `JWT_SECRET = <whatever you like here, but secure>`
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
    GET http://localhost:7000/…
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
      /*  insert your (req,res) => {} block here, eg: */
      (req, res) => {
        res.json({
          user: req.user
        })
      }
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
1. Add the following to your routes/auth.js:
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
1. Add functionality to the button and the form:
1. We want to preserve log(in our browser's console.) stop the form from submitting as the browser normally does, event.preventDefault() in signinform.js
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
1. we will make the form pass the results now back up to whatever object rendered the form, (which is our app) and then they will deal with the results. (see below the lines with onSignIn)
    ```javascript
    function SignInForm({
      onSignIn
    }) {
      return (
        <form
        onSubmit = {(event)=>{
          //prevent old school form submission
          event.preventDefault()
          console.log('form-submitted', event.target)
          const form = event.target
          const elements = form.elements //the key value pairs
          const email = elements.email.value
          const password = elements.password.value
          console.log({email, password})
          onSignIn({email, password})
        }}>
        …
    ```
1. Add the handling of the result to your app:
    ```javascript
    onSignIn = ({email, password})=>{
      console.log('App received', {email, password})
    }
    ```
    ```javascript
    <SignInForm
      onSignIn = {this.onSignIn}
    />
    ```
1. To test the request we'll need axios inside our web folder:
    ```
    cd web
    yarn add axios
    ```
1. Then inside the /web/src/api/ folder (still frontend) we want to make a new file called init.js
    ```javascript
      import axios from 'axios'

      const api = axios.create({
        baseURL: 'http://localhost:7000' //in reality this would be https
      })

      export default api
    ```
1. Then make an auth.js in the same folder:
    ```javascript
    import api from './init'

    export function signIn({ email,  password}){
      return api.post('/auth', {email, password}) //returning api.post because we want it accessible outside the function.
      /*the above is shorthand for {email: email, password: password}*/
      .then((res) => {
        return res.data
      })
    }
    ```
1. In App.js add the following import to allow us to use it now
    ```javascript
    import { signIn } from './api/auth'
    ```
1. Amend the app.js onsignin function to make use of it:
    ```javascript
    onSignIn = ({email, password})=>{
        console.log('App received', {email, password})

        signIn({email, password})
        .then((data) => {
          console.log('Signed in:',data) //we expect to see the token returned in the browsers developer console.
          console.log({email, password})
        })
    ```
1. At this point if you try to run the app you will get an error, the reason is because you have two servers running on different ports and by default they aren't allowed to talk to each other so we have to add a particular header:

    we need to configure the access control **allow origin** header (necessary to allow cross port comms)

    go back to the backend api folder and do
1. `cd api`

    `yarn add cors`
1. In the server.js: 
    ```javascript
    const cors = require('cors')
    …
    server.use(cors()) //Allow other origins to access us (ie react frontend)
    ```
1. Now at the state where a valid login will recieve a valid JWT. Now how to make it so that the frontend browser makes use of that when requesting subsequent pages
1. Referring to the axios docs, you can pass in headers, like the bearer [token] one used in the check.http
1. But we are wanting to change the defaults so that any future axios requests will have that header in place.
1. We can just use one line like 'ourinstance.common.headers…'
1. In the init.js file (in web) :
    ```javascript
    export function setToken(token){
      api.defaults.headers.common['Authorization']= `Bearer ${token}`
    }
    ```
1. Make an /api/products.js file with the following:
import api from './init'
    ```javascript
    export function listProducts(){
      return api.get('/products')
      .then((res) => res.data)
    }
    ```
1. Make a component did mount statement after the render statement in the app.js:
    ```javascript
    componentDidMount(){
      //when this app appears on screen
      listProducts()
      .then((products) => {
        console.log(products)

      })
      .catch((error) => {
        console.error('error loading products', error)
      })
    }
    ```
1. Ensure that you imported that listProducts call at the top of app.js:
    ```javascript
    import { listProducts } from './api/products';
    ```
1. At this stage it still won't work because we're not passing back any authorization header.
1. Amend the onSignIn function in the app.js to :
    ```javascript
    onSignIn = ({email, password})=>{
      console.log('App received', {email, password})

      signIn({email, password})
      .then((data) => {
        console.log('Signed in:',data)
        console.log({email, password})
        const token = data.token
        setToken(token) //now all future requests will have the authorization header set.
        listProducts() //try to list the products now with the token set:
        .then((products) => {
          console.log(products)
    
        })
        .catch((error) => {
          console.error('error loading products', error)
        })
      })
    }
    ```
1. Next task is to change behaviour upon sign in, for that we need to keep track of state.
1. add a state variable to your app.js at the top of the class:
    ```javascript
    state = {
      decodedToken: null
    }
    ```
1. using JWT decode to decode the base64 payload 

    `cd web`

    `yarn add jwt-decode`
1. we want our sign in method to return the jwt token
1. create a new token.js file in /src/api to handle all the jwt token stuff
1. add to the auth.js file:

    `import decodeJWT from 'jwt-decode'`
1. Auth.js now looks like:
    ```javascript
    import api from './init'
    import decodeJWT from 'jwt-decode'

    export function signIn({ email,  password}){
      return api.post('/auth', {email, password}) //returning api.post because we want it accessible outside the function.
      /*the above is shorthand for {email: email, password: password}*/
      .then((res) => {
        const token = res.data.token
        const decodedToken = decodeJWT(token)
        return decodedToken
        // return res.data
      })
    }
    ```
1. amend the onsignin function to the following:
    ```javascript
      onSignIn = ({email, password})=>{
        console.log('App received', {email, password})

        signIn({email, password})
        .then((decodedToken) => {
          console.log('Signed in:',decodedToken)
          this.setState({decodedToken})
        })
      }
    ```
1. To display some simple user information to the signed in user, amend the render method as follows:
    ```javascript
    render() {
        const { decodedToken } = this.state
        return (
          <div className="App">
            <header className="App-header">
              <h1 className="App-title">Welcome to Lake Disappointment</h1>
            </header>
            <p className="App-intro">
              Now delivering, shipping millions of new products
            </p>
            {
              !!decodedToken ? (
                <p>Email: { decodedToken.email } </p>

              ) : (
                <SignInForm
                  onSignIn = {this.onSignIn}
                />
              )

            }
          </div>
        );
      }
    ```
1. In the conditional above for a decoded token where currently we're just displaying the user's email, the below is an example of some other information we may like to display:
    ```javascript
    <p> Signed in at { new Date(decodedToken.iat*1000).toISOString() }</p>
    <p> session expires at { new Date(decodedToken.exp*1000).toISOString() }</p>
    ```
1. At this point if the browser is refreshed, the session is lost, if we want the session to persist, we need to look into storing the authentication token on the user's browser (there are two options, local and session storage, session means for the life of the web browser program, and local is more long term (cookie))

    look up mozilla dev network docs: API/Window/localStorage for some information about that.
1. There are javascript calls that you can use to store values to a users local storage, the values are key-value pairs. Those calls are:
    * localStorage.setItem(key, value)
    * localStorage.getItem(key)
    * localStorage.removeItem(key)

    Eg.

    `localStorage.setItem('preferredColor','teal')`

    `const favColor = localStorage.getItem('preferredColor')`
1. We will encapsulate all that logic in it's own file
1. create a /web/src/api/token.js file and fill it with this code:
    ```javascript
    //we'll call our key 'userToken' in case other types of tokens are neccessary down the track
    const key = 'userToken'

    export function saveToken(token) {
      if (token){ 
        localStorage.setItem(key, token)
      }
      else{ //if no token is supplied, take it as a sign out.
        localStorage.removeItem(key)
      }
    }

    export function getToken(){
      const token = localStorage.getItem(key)
    }
    ```
1. We want to consider if the token on the users computer becomes corrupted or not?
1. we want an ability to know if the token is valid or not, to do that we'll need the help of jwt-decode so import it at the top of your token.js file:

    `import decodeJWT from 'jwt-decode'`

    then we can amend our getToken method to use that decode function to check if it's able to decode it (if it's formatted incorrectly it won't be able to be decoded and so we will know it's corrupted)

    The docs for jwt-decode state that if its invalid it will throw an error, any code that does that will have to have such a situation accounted for with a *try* and *catch*:

    ```javascript
    export function getToken(){
      const token = localStorage.getItem(key)
      try{
        const decodedToken = decodeJWT(token)
        // the token is VALID
      }
      catch(error){
        // the token is invalid
      }
    }
    ```

    **Note: In regards to the term _valid_ above, it means the token is formatted correctly, it doesn't guarantee that the server's logic will view the token as valid (it may have expired for example)**
1. So now that we've gotten that far, as noted we haven't handled for the event that the token is expired.

    To do that, add the following bit of logic to your getToken() function (which we may as well rename at this point to getValidToken) within the VALID try block that compares the *now* time to the decodedToken.exp time:
    ```javascript
    export function getValidToken(){
      const token = localStorage.getItem(key)
      try{
        const decodedToken = decodeJWT(token)
        //valid token at this point otherwise would have moved to catch
        const now = Date.now() / 1000
        //check if token has expired
        if (now > decodedToken.exp) {
          return null //the token is expired therefore invalid
        }
        return token //if execution got this far then it must be ok.
      }
      catch (error) {
        return null //the token was badly formatted or corrupted therefore invalid
      }
    }
    ```
1. the above is a good way to handle it because it encapsulates all the logic into that token file and the rest of the program doesn't need to know how that token is stored or retrieved.
1. We also want to have a function to get the decoded token:
    ```javascript
    export function getDecodedToken() {
      const validToken = getValidToken()
      if (validToken){
        return decodeJWT(validToken)
      }
      else{
        return null
      }
    }
    ```
    **Note: You will notice that we have not placed the above call to decodeJWT (which is capable of throwing errors) within a try-catch block, in this particular case before that is called the getValidToken was called (which does make the same call and vetted the result) so we can be quite confident in this case that returning the result of a subsequent call to it will not throw an error**

    **As an aside, in class it was shown that the following may be a slightly safer way to write the same logic:**
    ```javascript
    export function getDecodedToken() {
      try{
        return decodeJWT(getValidToken())
      }
      catch(error){
        return null
      }
    }
    ```
1. Now that we've made the token file full of its helper functions we want to make use of it in our /web/src/api/auth.js file so import it

    `import {saveToken} from './token'`
1. At this point the instructor saw that we were saving the token AND setting the headers so decided to move some logic out of the auth.js file and into the init.js file…

    So now our init.js which originally was only setting the headers, is going to also save the token, so we add that in:

    ```javascript
    import axios from 'axios'
    import { saveToken } from './token'

    const api = axios.create({
      baseURL: 'http://localhost:7000' //in reality this would be https
    })

    export function setToken(token){
      saveToken(token) //call our saveToken function.
      api.defaults.headers.common['Authorization']= `Bearer ${token}`
    }
    
    export default api
    ```
1. At this point, when looking at the auth.js file notice how saveToken and setToken look very visually similar, so one might opt to rename saveToken to something like rememberToken. (for global find and replace in vs code: **Ctrl + Shift + F** or click the magnifying glass on the left side)
1. Now based on the logic we wrote in our token.js file, we know that it will be capable of handling a null token as a signal to sign out. Remember this code from token.js?

    ```javascript
    export function saveToken(token) {
      if (token){ 
        localStorage.setItem(key, token)
      }
      else{ //if no token is supplied, take it as a sign out.
        localStorage.removeItem(key)
      }
    }
    ```
    So to facilitate that we will want to amend our init.js code's setToken(token) function to cease sending the token data in the headers of every subsequent request from now on (if the function was called with a token value of null):

    ```javascript
    export function setToken(token) {
      saveToken(token)
      if (token){
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }
      else{
        delete api.defaults.headers.common['Authorization']
      }
    }
    ```
1. **Note:**There was some conversation in class regarding the JWT base64 encoding and reasons for that, if you want to hear jump to 1:50:45 of the [screen recording](https://youtu.be/_ZXSCC3SEv4?t=6644)
1. Now because we have the init setting the token and setting the headers, we've established that that's its responsibility, but our auth.js file needs to be able to use that too so we then amended /web/src/api/auth.js to include the setToken call as well as the api it was originally importing:

    `import api, { setToken } from './init'`

    so now, since this is where we've 'gotten' the token, we can now call that to set it.

    Also since we've now written a function to get a decoded token, we can remove the code here that is also getting a decoded token and replace it with a function call.
1. Amend your auth.js file to the following:

    ```javascript
    import api, { setToken } from './init'
    // import decodeJWT from 'jwt-decode'
    // import { saveToken } from './token'
    import { getDecodedToken } from './token'

    export function signIn({ email,  password}){
      return api.post('/auth', {email, password}) //returning api.post because we want it accessible outside the function.
      /*the above is shorthand for {email: email, password: password}*/
      .then((res) => {
        const token = res.data.token
        setToken(token)
        // const decodedToken = decodeJWT(token)
        // return decodedToken
        return getDecodedToken()
      })
    }
    ```
1. to handle issues where the token is expired, go back to the init.js file and pull in the getValidToken call:

    `import { saveToken, getValidToken } from './token'

    What we do next is within our init.js file, not within any function, we call getValidToken and then with what that returns, immediately call setToken and pass it that. 

    `setToken(getValidToken())`

    **Note: where this lives (in which file) doesn't matter so much as long as it's run upon initialization.**
1. Now the way our app is, is that upon initialization it initializes its state to have a decodedToken set to null. We can now update that to take advantage of the logic we wrote in the token.js file, so amend these lines of your App.js file:
    ```javascript
    state = {
      decodedToken: getDecodedToken()
    }
    ```

    and don't forget to import that call into your App.js file

    ```javascript
    import { getDecodedToken } from './api/token'
    ```

    you can also remove the setToken import from your App.js file as our signIn method is now taking care of that.

    
1. Now if you test the page in your browser:
    * in the developer console, in the React tab you can see the decoded information about the token from your app's State.
    * now you can see the userToken being saved to your local storage by checking storage tab.
    * if you manually delete the locally stored value you will then be seen as signed out.
    * if you change its value and attempt to refresh the page you will notice it disappears, that's due to this great line: `setToken(getValidToken())`

## currently have sign in but no sign out functionality
1. create a sign out function: in auth.js
    ```javascript
    export function signOutNow(){
      setToken(null)
    }
    ```
1. import signOut to app.js
    ```javascript
    import { signIn, signOutNow } from './api/auth'
    ```
1. Add a sign out button to app.js
    ```javascript
    <button onClick = { this.onSignOut }>
    Sign Out
    </button>
    ```
1. and link the button to a function in your app class:
    ```javascript
    onSignOut = () => {
      signOutNow()
      this.setState({ decodedToken: null})
    }
    ```

## Moving onto working individually on some challenges
# Challenges
1. Sign up form
2. Add product listing to React
3. Add create product to API
4. Add create product form to React
5. Add update product to API
6. Add edit product form to React

(commit 560f79b860bc209d87032d9268f7f1f1f24d0666 is where I begin on working on the challenges)

# Steps I've taken (and struggles) to implement the challenges
1. made a new SignUpForm component
1. Tried to test the sign up and I suspect I've corrupted the database now by trying an email that was already in use by another user.
## MongoError: E11000 duplicate key error collection: storms.users index: username_1 dup key: { : null}
1. Turns out I couldn't ever create more than one user because my mongo database had this additional index on the users table called username_1

    below is the output from a mongo shell query showing the extra one in the middle:
    ```
    > db.users.getIndexes()
    [
      {
        "v" : 2,
        "key" : {
          "_id" : 1
        },
        "name" : "_id_",
        "ns" : "storms.users"
      },
      {
        "v" : 2,
        "unique" : true,
        "key" : {
          "username" : 1
        },
        "name" : "username_1",
        "ns" : "storms.users",
        "background" : true
      },
      {
        "v" : 2,
        "unique" : true,
        "key" : {
          "email" : 1
        },
        "name" : "email_1",
        "ns" : "storms.users",
        "background" : true
      }
    ]

    ```
    This was resulting in the following error message from the server when attempting to create a new user:
    ```
    MongoError: E11000 duplicate key error collection: storms.users index: username_1 dup key: { : null}
    at Function.MongoError.create (/home/alex/apps/js/lakedisappointment/api/node_modules/mongodb-core/lib/error.js:31:11)
    at toError (/home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/utils.js:139:22)
    at /home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/collection.js:668:23
    at handleCallback (/home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/utils.js:120:56)
    at /home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/bulk/unordered.js:465:9
    at handleCallback (/home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/utils.js:120:56)
    at resultHandler (/home/alex/apps/js/lakedisappointment/api/node_modules/mongodb/lib/bulk/unordered.js:413:5)
    ```
    The solution was to go and tell Mongo to not put an index on this username field by doing the following ([stackoverflow question on this topic](https://stackoverflow.com/questions/13454178/mongoerror-erre11000-duplicate-key-error))
    
    In a terminal execute the following

    `mongo`

    you can see the [documentation of mongo here](https://docs.mongodb.com/manual/core/databases-and-collections/#collections)

    you can check what database this app was using by looking at api/models/init.js and checking the mongoose connect line:
    ```javascript
    mongoose.connect(
      'mongodb://localhost/storms',
      { useMongoClient: true }
    )
    ```
    That means that I'm using a database called storms (probably because I copy and pasted this code from the previous exercise)

    In the mongo terminal you can then list the databases with

    `show dbs`

    then switch to the storms one with

    `use storms`

    then list the 'collections' aka tables of that db with:

    `show collections`

    then list the indexes on the users table

    `db.users.getIndexes()`

    then in my case I solved it quickly by executing:

    `db.users.dropIndexes()`

    Now my indexes on my users' collection just looks like this:
    ```
    > db.users.getIndexes()
    [
      {
        "v" : 2,
        "key" : {
          "_id" : 1
        },
        "name" : "_id_",
        "ns" : "storms.users"
      }
    ]
    ```
### So why did that happen?

The most I could find about this is that it is something that is added by the **passport-local-mongoose** package that we use with our user model. However reading the documentation suggests that a flag uniqueUsername or something which governs that behaviour should be set by default to true which should have prevented such a thing from happening, and we didn't set it to anything ourselves manually, so how that "username_1" index came to be set I still don't know. After scrutinising this aspect of my app I realised I had just copy and pasted the mongoose connecting code from my previous app and that's why the database name is 'storms', and that this may have had something to do with the user's table getting that extra index. However Isabelle was also affected by this issue but she actually made a new database for this exercise, also she's using a mac whereas I'm on Linux and we couldn't think of anything our environments had in common so how we came to be affected by this is not known.
**Update: there were at least another two people affected by this issue but we couldn't figure out the cause**

# Instructors solutions to the challenges:
( *quick notes of instructors solution - high level (means I don't have exact code snips but its nothing we haven't done before )* )
## listing the products
If we're signed in, list the products

Otherwise set the state's products list to null. (That was put in a `load()` method)

How do we detect when they click sign out? Apparently **this.setstate is asynchronous**

The second argument to setState is a callback function that setState will call once setState is finished.

But instead he uses `componentDidUpdate` and then in there compares the decodedToken to the `prevState`'s decodedToken and if it's changed then runs the load method.

( *in the screen recording he's running through how the internals of the setState method works* )

## form to create new products

The form to create a new proudct follows the same pattern we used to make the signup form.

Now how to update the state to include the newly created product?

He uses `this.setState` to concat the new product onto the existing product array.

When creation happens, the response from the backend should spit back the newly saved document from the db. This will include the documents id property `_id`. In this way the frontend then has the necessary information so that if it wants to make a subsequent request in relation to that item, it has the _id to use to identify which one it's talking about to the server. (*As opposed to sending a request to the server to have a product created, and getting only a success message, and then needing to make a subsequent request to the server to find the document that was just created to get a hold of its document _id*)

## updating a product

A good amazing cheatsheet that makes a good reference at this point is [mongoose vs active record](https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord)

He's using the `findOneAndUpdate(conditions, changes, {new: true, runValidators: true})`

The `{new: true, runValidators: true}` is to override the mongoose defaults 
`new: true` = Please return to us the NEW product once you've made it (*front end to backend*)
`runValidators` = Pretty self explanatory, ensures the data passes the validation tests in the model's schema

He adds that to the backend code in a new route: put /products/:id

(you can refer to his [git commits](https://github.com/Coder-Academy-Patterns/yarra) for step by step code changes, *they may be on a non-master branch if you don't see them on the master*)

He wanted to have a single product form that could be used for both creating and editing.

* He handles the difference between the two cases with props. He changes the title of the form using a prop so the caller can decide, and then he runs a generic 'onSubmit' that is also passed by the caller so the caller can handle what to do with the data depending on use case.

* or put more explicitly:

    There is a function for creating a new product, and there is a function for updating an existing product, those functions invoke different mongoose database calls. (*in the instructors repo those functions are `export function createProduct(data) {...}` and `export function updateProduct(id, data) {...}` within the file /web/src/api/products.js*)

    Those functions exist in an appropriate file along with other files of database modification functions like the ones for adding new users. (*The files in /web/src/api*)

    The App.js file imports those two functions so it can use them.

    The App.js logic, when showing the form to create a new product, passes that form a callback function (a function the form can call when its button is clicked) which the App.js logic sets as the function for creating a new product.

    The App.js code that has to do with showing the form for updating a product, renders the **same** form as it does for creating a new product, but when it passes *that* form a callback function it sets that function to be the one for **editing** a product. 

    In this way the code we wrote for displaying a Form to do with products has been reused, and the data collected by the form will be funneled to the appropriate function (create or modify) because the Form was passed a function to just call when it was finished, and it's now the responsibility of the calling component (App.js) to arrange the appropriate function to be passed.

### doing the edit form for updating products

( *in the components/Product.js* )

He adds an onEdit command in an onClick on the div of an individual product listing.
The product list he has as its own component.

The individual **product** component's responsibility to the parent component (product list): **I'll let you know when I'm clicked**

The **product list** component's responsibility to the update function: I'll let you know **which one** was clicked.

**Note: if you need to wrap multiple elements in a div because it's in a javascript return statement, but you don't actually want a div, use the fragment element**

Clicking on a product then has the effect of setting a value in the state called activeProductId and this gets set to the id of the product that was clicked.

In order to get the product edit form to render when a product was clicked, the productList component has a prop called renderEditForm(product) which is a function passed to it by the parent calling function (as an arrow function).

To ensure that the form for editing loads pre-filled with the existing data of the product, the product object is passed to the form, which the form then uses to see what the current data is, and set the defaultValue of its fields to be that data, in this way if you had a product with brand name 'ACME' and name 'Widgy bar' then if the user clicks on it, the same form as used for creating new products gets displayed beneath the product and the field for brand name already has 'ACME' and the field for name already has 'Widgy bar' in it. 

You then use .map to find the product in the list that was updated, and if it was it gets replaced with the updated version.

Finally set the state's activeProductId back to null.

# following along to make a wishlist functionality where users can maintain a wishlist of products (demonstrates how to manage database relationships)

1. Create a new model called wishlist initially a copy paste of the models/product.js code
    ```javascript
    const mongoose = require('./init')
    const Schema = mongoose.Schema

    // similar to :
    // t.references :owner, foreign_key: {to_table: :users}

    const Wishlist = mongoose.model('Wishlist', {
      user: { type: Schema.ObjectId, ref: 'User' },
      name: String
    })

    module.exports = Wishlist
    ```

    ```javascript
    const mongoose = require('./init')
    const Schema = mongoose.Schema

    // similar to :
    // t.references :owner, foreign_key: {to_table: :users}
    //what comes after the .model in the below line, is the schema.

    const Wishlist = mongoose.model('Wishlist', {
      user: { type: Schema.ObjectId, ref: 'User', unique: true },
      //unique true so that each user will only have ONE wishlist.
      //one wishlist will have multiple products, we do that by wrapping it in square brackets
      products: [{type: Schema.ObjectId, ref: 'Product'}],
      name: String
    })

    module.exports = Wishlist
    ```

1. Next up is routes for the wishlist:

    Copy the products routes file and then edit it to change it to be about wishlists with a couple tweaks:
    ```javascript
    const express = require('express')
    const Wishlist = require('../models/Wishlist')
    // const authMiddleWare = require('../middleware/auth')
    const { requireJWT } = require('../middleware/auth')
    const router = new express.Router()

    router.get('/wishlist', requireJWT, (req, res) => {
      
      // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
      Wishlist.findOne({user: req.user })
      .then((wishlist) => {
        res.status(200).json({wishlist})
      })
      .catch((error)=> {
        res.status(400).json({error: error.message}) //if you return the whole error you may be giving away too much information
      })
    })

    module.exports = router
    ```
1. We changed it to error code 500 for internal server error as it wouldn't be the users fault in this case.
    ```javascript
    const express = require('express')
    const Wishlist = require('../models/Wishlist')
    // const authMiddleWare = require('../middleware/auth')
    const { requireJWT } = require('../middleware/auth')
    const router = new express.Router()

    router.get('/wishlist', requireJWT, (req, res) => {
      
      // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
      Wishlist.findOne({user: req.user })
      .then((wishlist) => {
        res.status(200).json({wishlist})
      })
      .catch((error)=> {
        res.status(500).json({error: error.message}) //if you return the whole error you may be giving away too much information
      })
    })

    module.exports = router
    ```
    Remember to add require('./routes/wishlists'), to your `server.use` array in server.js

1. Now make a test `GET` method in the check.http file, but first you will have to make the post request to authenticate so you can grab a copy of the token, *then* you can make a post request like this:
    ```
    ###

    GET http://localhost:7000/wishlist
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o
    ###
    ```

1. Make the wishlist return the products in itself:

    ```javascript
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
      })
      .catch((error)=> {
        res.status(500).json({error: error.message}) //if you return the whole error you may be giving away too much information
      })
    })

    
    module.exports = router
    ```

1. And return an empty array otherwise:
    ```javascript
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
    ```

1. We do it this way, in the backend, so that the client side doesn't have to have as much logic about how to handle a possible null response

1. Moving onto handling the post from a user to add a product to the wishlist:
    ```javascript
    router.post('/wishlist/products/:productID', (req, res) => {
      const { productID } = req.params
      
    })
    ```
1. Going to use the `findOneAndUpdate` to make the update.
    ```javascript
    router.post('/wishlist/products/:productID', requireJWT, (req, res) => {
      const { productID } = req.params
      Wishlist.findOneAndUpdate({ user: req.user }, {
        // change to come soon 
      },
      { 
        upsert: true, runValidators: true //upsert = update and insert
      })
    })
    ```
1. Add the code to make the change for us using `$addToSet`
    ```javascript
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
          upsert: true, runValidators: true //upsert = update and insert
        })
    })
    ```

    ```javascript
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
        .then((wishlist) => {
          res.json({products: wishlist.products })
        })
        .catch ((error) => {
          res.status(400).json({error: error.message})
        })
    })
    ```

1. Now to add a couple tests to your check.http, one with a valid and one with an invalid product id.

    You can see that the check will fail if we pass as an id 'robot' but it will pass if we pass what looks like a valid id: 

    Below the one ending in 222 doesn't correspond to anything in the database but that request is still honored.
    ```
    POST http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d222
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o

    ###

    POST http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d16b
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o

    ###
    ```

1. The opposite of `$addToSet` is `$pull`, needed for removing products from the wishlist.

    To implement that functionality we basically copy and paste what we wrote for adding and then change the operator from `$addToSet` to `$pull` and change the http verb to `delete`:
    ```javascript
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
        .then((wishlist) => {
          res.json({products: wishlist.products })
        })
        .catch ((error) => {
          res.status(400).json({error: error.message})
        })
    })
    ```
1. Then test in your check.http file :

    ```
    ###

    DELETE http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d16b
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o
    ```

1. Now as it is, the response for the wishlist is just an array of product ids. But it would be nicer if it responded with the actual products.

    We can make that happen easily with the populate method, inserted into our GET wishlist router code:

    ```javascript
    router.get('/wishlist', requireJWT, (req, res) => {
      
      // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
      Wishlist.findOne({user: req.user })
      .populate('products')
      .then((wishlist) => {
        if (wishlist) {
    …
    ```

    That's just for the router.get, but regarding .post and .delete, you can also make them respond in the same way by adding the same line just before their `.then` lines as we did above.

# Challenges to expand the wishlist functionality

- Add wishlist listing to React, and add/remove buttons to each product
- Add categories to API: products belong to many categories, categories have many products. There may be several ways to model this! (see the orange headings here for categories: https://www.amazon.com.au/gp/site-directory/ref=nav_shopall_btn)
- Add categories nav to React
- Add dotenv package to api, and use for mongo URI, JWT secret

## Add wishlist listing to React

# 20171212 - Follow along in class demonstrating routing with different URLS in ReactJS

1. Regarding the functionality to add or remove from the wishlist:
uses key in fragment of return statement of wishlist

1. onAddToWishlist and onRemoveFromWishlist are functions passed as props
using the conditional trick to only render buttons if those functions are passed through.

    In this way he ensures that when viewing your current wishlist, only the remove from wishlist button shows, not also the add to wishlist button.

    When those functions are passed through from the app.js file, in there they are declared as functions that basically make api calls to make the changes and then update the state once they get a response back.

1. We're going to be using *react-router* which has become the defacto standard for routing in react (they have a dedicated docs site for learning about it - when you go there click on the web button for the web docs).

    Looking at the section 'static routing'.

    An example, looking at their own docs, they have a side bar that persists when you navigate their docs. you can see that that is based on the url as everything in the docs for web is preceeded by .../react-router/web/...

1. Install it in your web (frontend) directory with `yarn add react-router-dom`

    It was mentioned that this was related to 'history': the javascript library handles the cross browser issues with handling different routes with callbacks that run when the path changes. 

    Import into your app.js: 
    
    `import { BrowserRouter as Router, Route } from 'react-router-dom'`

    ...that 'as' above is like an alias it allows us to do the following instead of <BrowserRouter>.

    In the app.js in the render's return statement, which returns single div, we're going to wrap it in `<Router> </Router>` tags so that it's now a `<Router>` element that is being returned and no longer a `<div> ` 

    The router adds 'context' to your app

1. We only want the h2 and h1 to only show on the home page.

    Within the <div> mentioned above add:
    ```javascript
    <Route path = '/' exact render={()=>(

    )}
    />
    ```

    The `exact` ensures it doesn't see that path as a prefix.

    Then within that block is where you put the `<h1>` and `<h2>` elements, now they will only render when the path is exactly '/'.

    Now you can wrap the h1 and h2 in a `<Fragment>` element to fix the syntax errors of trying to return multiple elements.

    Scroll all the way to the top of your file, where you are importing React, looking at the `{Component}` part, add in fragment to that: `import React, {Component, Fragment} from 'react'`

    Now you'll notice if you change the url to http://localhost:3000/somethingelse it will now no longer render the h1 and h2.

1. Now we'll repeat that for the wishlist section by wrapping it in a **<Route ...>** element to ensure only when the user visits '/wishlist' will it render.

    Because we're using an arrow function we're still able to refer to the variables that were declared outside of that function. eg, in the case of the wishlist, we still have access to the **signedIn** and **wishlist** variables and also the `this.onRemoveProductFromWishlist` and similar.

1. At the moment our render method is rendering everything. Now we'll look at splitting that up into their own logical pages ('/' for home page, '/signin' for the the signin page etc).

    Wrap the sign up and sign in html in another route: 
    ```javascript
    <Route path='/signin' exact render = {()=> (
      <Fragment> 
        <h2> Sign In </h2>
        <SignInForm
          onSignIn = this.onSignIn }
        />
      </Fragment>
      )}
      />
    ```
    The signup is done the same way.

    Showing an empty div now in the ternary for if they're signed in so change that to:
    ```javascript
    <Route path='/signin' exact render = {()=> (
      <Fragment> 
        // the code for displaying a users signed in details
      </Fragment>
      )}
      />
    ```

1. Moved the rendering code for the list of products to a path /products as above

1. Install the 'Prettier' VS Code plugin `Prettier formatter for Visual Studio Code` by Esben Petersen if you want to have your indentations and formatting helpfully handled automatically for you

    **You might want to commit your changes before you run that.**

    *If you install a plugin that requires you reboot your vscode, be aware that any running terminals will be blown away (which might have been running your dev server so you may have some server restarting to do*

    run it from vs code command palette as 'format document'

    Prettier.io has a section on pre-commit hook, which you can follow if you want it to automatically format your style before git committing.
1. Regarding Prettier and VS Code, there is some level of customization offered by Prettier if it doesn't exactly match your 'style'. Here are some useful VS code settings:

    [// Convinces employers that you are using spaces instead of tabs](https://stackoverflow.blog/2017/06/15/developers-use-spaces-make-money-use-tabs/)
    ```
    "editor.tabSize": 2,
    "editor.insertSpaces": true,
    "editor.detectIndentation": true,
    ```

    // Set prettier to not include semicolons and prefer single quotes
    ```
    "prettier.singleQuote": true,
    "prettier.semi": false,
    ```
    
    // If you are annoyed by node_modules showing up in the sidebar
    ```
    "files.exclude": {
      "node_modules/": true,
      "*/node_modules/": true
    }
    ```
    [Other useful VS Code settings](https://github.com/Microsoft/vscode-tips-and-tricks#tune-your-settings)
1. Making a route for creation of new products as '/admin/products'

    we now have 

    * /signin
    * /signup
    * /products
    * /wishlist
    * /admin/products

1. Next is adding a navigation bar with links to all these sections.

1. Code up to this point available on the instructors `routes` branch

1. Making a new component called PrimaryNav

    ```javascript
    import React from 'react'
    import { Link } from 'react-router-dom'

    function PrimaryNav({

    }) {
      return(
        <nav className='primary'>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/products'>Products</Link></li>
            // Link to= instead of a href= for the react-router-dom syntax
          </ul>
        </nav>
      )
    }

    export default PrimaryNav
    ```

1. 'Inclusive design patterns' is a recommended book

    Talks about stuff like using a `<ul>` unordered list and `<li>` list items for nav items because if css doesn't work on older browsers it still looks kind of presentable and accessible to accessibility technologies.

1. Import the primary nav we just made on the main app.js file:

    `import PrimaryNav from './components/PrimaryNav'`

    then make it appear at the top of our website:
    just under `<div className="App">` place:
    `<PrimaryNav />`

    repeat this process for the other links you want to add.

1. Adding custom css:

    ```css
    nav.primary ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      padding: 0.5rem;
    }

    nav.primary a {
      display: block;
      padding: 0.5rem 0.5rem;
    }
    ```

1. Next step is to conditionally display nav bar links depending on whether the user is signed in or not.

    pass a prop to the PrimaryNav component called 'signedIn' which can be used then in the return statement with ternary and fragments (you'll have to import fragment along with React)
    
    import React, { Fragment } from 'react'

    React is a default export (no curly braces), Fragment is a named export (use curly braces)

1. Regarding the import statement and having some being within curly braces:

    If what you're importing looks like this:

    ```javascript
    export function listWishlistProducts(){
      return api.get('/wishlist')
      .then((res) => res.data)
    }

    export function createProduct(productData){
      return api.post('/products', productData)
      .then((res) => res.data)
    }
    ```

    then you will be mentioning their names in curly braces.

    If however what you're importing looks more like this:

    ```javascript
    import React from 'react'

    function SignUpForm({
      onSignUp
    }) {
      return (
        // <html code>
      )
    }

    export default SignUpForm
    ```
    then you would refer to SignUpForm **without** curly braces.

1. Following along with devise's concept from rails of `before_action authenticate_user`, we want to redirect the user if they attempt to visit /wishlist for example before they're signed in.

    Go to the part of your app.js <Route path ='/wishlist'...>

    checking docs for react-router, there's a redirect component we can use, <Redirect to='/signin'>

    `import {Redirect} from 'react-router-dom'`

    and add it into the wishlist rendering code using a ternary:

    `signedIn ? (<Fragment>...</Fragment>) : (<Redirect to='/signin' />)`

1. Doing this for every page that needs to be signed in would get repetitive so going to extract the logic out to a reusable function

    at the top of the render method (in app.js) :
    ```javascript
    const signedIn = !!decodedToken //true if decodedToken is not null
    const requireAuth = (render) => (props) => (
      signedIn ? (
        render()
      ) : (
        <Redirect to='signin' />
      )   
    )
    ```
    The double arrow above means that what it returns is *another* function, but the *internals* of that function have been amended to have the custom render() function added into it. (a lot spoken in the screen recording about this)


1. You can then make use of that by wrapping the function where you want to use it in the requireAuth like so:

    ```javascript
    <Route path='/wishlist' exact render = {requireAuth(()=> (
      <Fragment> 
        // the code for displaying a users signed in details
      </Fragment>
      ))}
      />
    ```
1. The app currently does not present login errors to the user upon a wrong password or similar, we need to capture any errors in the state, and present such errors if they are present.

    If we make a function like this:
    ```javascript
    const saveError= (error) => {
      this.setState({error})
    }
    ```

    we can change something like this

    ```javscript
    .catch((error => {
      this.setState({error})
    }))
    ```

    to this

    ```javascript
    .catch(saveError)
    ```

    example code to then conditionally display error:
    
    ```javascript
    {
      error &&
      <p>{ error.message } </p>
    }
    ```
1. This won't yet work because our current implementation doesn't pass the error along in our backend code.

    We tried to adjust the backend code and make use of the following but concluded it would have needed more involved work than initially thought

    ```javascript
    server.use((error, req, res, next) => {
      res.json({
        error:{
          message: error.message
        }
      })
    })
    ```

1. The **onSignIn** function in the app.js in the frontend didn't have a .catch statement so added that.

1. Now the error returned for an incorrect password was just the error code 400. 

1. Make an error component (because we're going to need to run some logic to decypher the true error for the user.)

    ```javascript
    import React from 'react'

    function Error({
      error
    }){
      return (
        <p> {error.message}</p>
      )
    }

    export default Error
    ```

1. You can then use it in the App.js with:

    ```javascript
    {
      error && 
      <Error error={error} />
    }
    ```

    ```javascript
    function improveMessage(message) {
      if (message === 'Request failed with status code 400'){
        return 'Please check the entered values'
      }
      return message
    }
    ```

1. You can make a method in the error component to change the error message each time and change it to be more human readable:

    ```javascript
    function improveMessage(message) {
      if (/status code 400/.test(message)){
        return 'Please check the entered values'
      }
      
      else if (/status code 401/.test(message)){
        return 'You must be signed in'
      }
      else if (/status code 500/.test(message)){
        return 'The server is on fire'
      }
      
      return message
    }
    ```

1. Add a **.catch** to the **onSignIn** logic to form a new error with a custom message, and then subsequently throw that error so in this way the context of what the user was doing at the time helps inform what appropriate error message should be displayed.

    then adds the logic to handle if we're on the sign in page and we are signed in then to redirect to the products page.



# 20171213 - continuing on from above 

1. There is an issue with the token validation logic in web/src/api/token.js

    Realised when the instructor pushed the app online, and subsequently moved the jwtsecret for the token into environment variables before pushing up.

    The issue was that an existing signin then became invalidated.. His frontend thought he was still signed in because it still had a valid token, but the backend was rejecting it because the secret had now changed, and the frontend didn't have the logic to deal with that scenario, so he fixed it at the time by just deleting the token from his cookies.

    The current logic is basically "if we have a decoded token, use it to attempt to load everything and assume its correct" 

1. Also if we enter something weird into the path url, it DOESN'T respond with 404.

1. Currently, the product list doesn't prevent products that are already in the user's wishlist, from getting an 'add to wishlist' button added to them as well.

    In his product component, he's adding a new `const inWishlist = true` to above the return statement to use that value to conditionally show the addToWishlist or removeFromWishlist buttons.

    For readability he's setting two other variables: `const showAddToWishlist = !inWishlist` and `const showRemoveFromWishlist = inWishlist`

1. Another issue is that the current implementation for determining which products will have a "Remove from wishlist" button instead of "Add to wishlist" is passed the actual wishlist which it then checks to see which prouducts are inside that. Because of future scenarios, products might not be the only category, and so we want to change the ProductList code to not pass the wishlist itself, but rather only the productsInWishlist, as that's the only information the ProductList component cares about.

1. If our api server is down the error message we get in the frontend is 'Network Error' which we can handle in our Error.js component
    ```javascript
    ...
    else if (/Network Error/i.test(message)) {
      return 'Cannot connect to the API server'
    }
    ...
    ```

1. React comes with a `<Switch>` element that can act as a case switch we can use to clean up our codes logic a bit.
    ```javascript
    <Switch>
    <Route path='/' exact render={()=>(<Component/>)}/>
    <Route path='/1' exact render={()=>(<Component1/>)}/>
    <Route path='/2' exact render={()=>(<Component2/>)}/>
    <Route path='/3' exact render={()=>(<Component3/>)}/>
    <Route render={({location} )=> (
      <Fragment>
        <h2> page not found: { location.pathname } </h2>
      </Fragment>
      ) } />
    </Switch>
    ```

1. The code componentDidUpdate() currently only checks if the decodedToken changed.

1. We're using requireJWT middleware for /products so we'll get rid of that
so that the products list is viewable without needing to be signed in.

1. Changing the code to ensure that products are viewable even when not signed in hit a problem where by we (the instructors implementation, mine might not be up to that point yet) were checking for the presence of a wishlist before even rendering the products list (for the good of the add and remove to wishlist buttons) so now we have to program it to handle the scenario where wishlist is null. Setting wishlist to an empty array will be easy but then breaks some of our clean assumptions like whenever the list is null its because we can't talk or haven't gotten a response from the server. whereas an empty list implies a successful response from the server.

    In the ProductList componenet code he uses a function to determine if a product appears in a wishlist and to return the appropriate key value pairs 

1. Next issue, the homepage doesn't show the products, but its still loading the data regardless.

    So the task is to change the code so that it only loads data from the api when particular paths are visited.

    Uses a function that checks for particular attributes in the state, if it's there then it returns it, if its not then at that point it attempts to load the relevant data.

    load on demand.
    
    You can see an example of this on the [instructors branch](https://github.com/Coder-Academy-Patterns/yarra/commit/9b31d80e62f4b31719e50278fd2f647b5ed9e6e2)

    Check out the loadSection function in his app.js

## Technologies mentioned and other random javascript tips

* bundlephobia.com for anything you `yarn add` and it will tell you how big that library is. 
* unpkg.com was shown as an example of minifying the javascript "minification"
* github.com/developit microbundle
* github.com/insin/nwb
* [The javascript quirks table](https://dorey.github.io/JavaScript-Equality-Table/)
* .some on an array is like ORing all the elements ||
    
    .every on an array is like ANDing all the elements &&
* babel turns your modern javascript syntax into older (but more widely supported) syntax

    babeljs.io
* on platforms that can host mongo apps, a couple mentioned in class:
    * mongoDB atlas - platform you could publish (requires phone number)
    * mlab.com - decent free plan

# Deployment steps

1. This app technically has three servers, the frontend server serving up our React frontend, the backend server responding to GET and POST etc requests from the web browsers of our users, and the mongo server serving the database requests coming from our backend server.

    To deploy our backend server we'll be using 'now' from zeit.co/now

    zeit.co/now  - similar thing to heroku, works with static websites, node, docker, 
    You can install it in a few ways, (download app and get an icon in your browser, install in your terminal)

1. Before we do any deploying we want to ensure that the app is not currently in a broken state so start it up and check its all working:

    go to your project: 

    `cd api`

    `yarn dev`

    `cd web`

    `yarn dev`

1. We'll install 'now' using the terminal way, 'now' will allow us to deploy our backend server:

    switching to a new branch for deployments first.

    `git checkout -b deploy`

    `cd api`

    `yarn add now --dev`

    this is slightly different to what they say on the website `npm install -g now` as what they say would install it for your whole system, not just the project you're working in.

1. If you then ran the command for whole system, then `which now` should output a path.

    If you did just the `yarn add` one then run `./node_modules/.bin/now login` and you can sign in with whatever email you like. (instructor's using the + feature of gmail to alter his gmail email to personalise it to zeit.

1. Then you need to go to your email and click the confirm link

1. You will then get a message saying verification code saved in a file, you should confirm that against the one sent to your email.

1. Next we need to sign up to mlab to host the mongo api part of our app:
    
    https://mlab.com/login/

1. After signing up, on your dashboard screen click on 'create new'

1. Select which cloud provider you want, aws gives 500mb storage free. aws is available in either us east or ireland regions

1. Then select the region you want and give a name for your database

1. Once its deployed you can view its details and can connect using a mongo terminal and below that line is another line which is the path to this version of your database, in your front end code of your app you'll then have to adjust the line where you have mongoose.connect localhost/..... to the path you see on that page.
you'll need to create a new user for the database to be able to go into its mongo terminal

1. We want to set our app to use our local db in Development, and the mlab one for production, so we need to add a package to help us do that:

    `yarn add dotenv --dev`

1. Then in the entry point to the api, which we find from our package.json file for the yarn start - it points to a file, probably server.js we want to do at the top:

    `require('dotenv').config()`

    then wrap that in this if statement:
    ```
    if (process.env.NOD_ENV !== 'production'){
        require('dotenv').config()
    }
    ```

1. In the api folder create a new file: .env which will be our dev one and then make another one as well called production.env

    .env will be key value pairs for our local db and production.env will be the key value pairs for our online cloud hosted mlabl one.

1. In the models init file I'm using mongodb://localhost/yarra, that's an example of a value that is an environment var.
put it into the .env file for our dev stuff:

    ```
    MONGO_URI = mongodb://localhost/yarra        
    ```

    then in the code you can replace the value with :
    `process.env.MONGO_URI`

1. Then go to api/middleware/auth

    In there we have our jwtSecret.

    Replace that hardcoded value with `process.env.JWT_SECRET`

1. You can use `openssl rand -base64 48` to help you generate some 'randomness' (note if you run into issues down the track, possibly the non alpha character symbols might not be supported in the password?)

1. Kill your api and start it again, and you should see successfully connected to your database, so you know your environment variables are coming through ok.

1. Ensure that your *.env files are added to your .gitignore so that those saucy secrets aren't leaked onto your github

1. Edit your scripts to ensure you have this for default cloud based startup: 
"start":"node server.js"

    Which is in contrast to our "dev":"nodemon server.js"  (remember the reason we used nodemon for dev is because it auto reboots our server whenever a file changes which speeds up our development times)

1. Get this line from the details of your hosted mongo db:
mongodb://<dbuser>:<dbpassword>....

    and put that into your production.env file:

    `MONGO_URI = mongodb://<dbuser>.......`

    and then change those dbuser and dbpassword placeholders with what you set up on the mlab site.

1. Then put in our JWT_SECRET value, make this different again to our development environment one. (the value should differ between your .env file and your production.env file)

    `JWT_SECRET = <the password you generated - might have to remove the non alph-numerical characters>`

1. Now we can deploy it with 'now':

    `./node_modules/.bin/now -E production.env`

    -E = use environment variables from a specific file

    You might get a notice about your code and logs being made public which you'll have to confirm to.

1. It will then spit out some output including a url, which is the url to your api now deployed online.

    You can test it by visiting that url and appending '/products' (without quotes) to the end of it (because we had a products route in our app)

1. You can add an alias script to help you run that deploy command in future:

    if you have 'now' installed globally on your system:

    `"deploy":"now -E production.env"`

    if you just have 'now' installed within your project:

    `"deploy":"./node_modules/.bin/now -E production.env"`


1. running `now ls` will show all your deployments, (**on the free tier you're only allowed three at any one time**)

    so you'll have to use the `now rm` command to remove deployments that are obsoleted, check the various now commands at this link:

    https://zeit.co/docs/features/now-cli has the commands you can use 

1. At this stage you have your api running on Zeit's 'now', you have an empty mongo db ready and waiting for it on mlab
and we have not yet deployed the front end (react) server.        

1. At this point, to test our online api with the REST client 
in a new  production.http testing file: at the top of the file put:

    `@host = https://yarra-api-fopwedad.now.sh`

    where 'https://yarra-api-fopwedad.now.sh' is the url that you got in your terminal output from the previous command `...now -E production.env`

    ```
    @host = https://yarra-api-fopwedad.now.sh

    ### list products

    GET {{host}}/products

    ### create a user - sign up

    POST {{host}}/auth/register

    ...
    ```

1. Those @variables are pretty handy, you could use them to keep your http files DRY (you may or may not wish to arrange for them to come from the .env file so keep sensitive data out of the http file (which is checked into github - see the docs for REST client if you want to find a way to do that)

1. If you make those requests you'll notice some extra headers being sent back by the api since it's now hosted on a service provider (X-Now-Region: ....)

    **Note:** when you click 'Send request' in the .http file you can't have any other text highlighted in that file at the same time.


If you've come this far, the next step is to deploy our server that serves up our front-end React code.

## Deploying frontend

1. You can update your backends url to something more memorable with the following command:

    `now alias https://yarra-api-fopwd....   yarra-api2`

    now that makes it a little easier to tell our frontend server where to find our newly hosted backend server.

    **Note: that that alias will have to be uploaded when you update your app and subsequently re-deploy as that will produce a new url.**


1. In the standard readme generated when you create a new react app, there is a section on using environment variables search "embedded during runtime" ?

    in /web/
    create a 
    .env.local with the following:
    ```
    REACT_APP_API_URL = http://localhost:7000
    ```
    and then in your /web/src/api folder your init.js file needs to be amended to make use of the new environment variable:
    ```
    const api = axios.create({
      baseURL: process.env.REACT_APP_API_URI
    })
    ```
    we don't need any `require` statement to use process.env because React already supports it.

    **Note we need to restart our frontend server at this point**

    ***From the readme: the prefix `REACT_APP_` is required**
    its a good reminder to you that this is REACT! AKA FRONTEND (End user has access to this information don't use secret backend secrets in here)

1. Now try to run your frontend server and if your environment variables are coming across OK then it should work and be talking to your local api

1. At this point if you are using any other services you will also want to go through your app and change any hardcoded values into environment variables (eg Stripe tokens, (also regarding Stripe for example you would change test tokens to proper prod ones when deploying))

1. Now we need to make another environment variables file for our production deployment. Make a new file .env.production in your /web/ folder and you can use the alias you set up before, eg:

    ```
    REACT_APP_API_URL = https://yarra-api2.now.sh
    ```

    ***Note: these environment variable are not sensitive, they are available on the browsers of our users, and as such there is no harm checking them into github**

1. Now you want to build your react server in preparation to deploying it:

    `cd web`

    `yarn build`

    this does all the minification stuff and combining of various javascript scripts into a single blob

1. Netlify has the power to connect to a github repo and automatically deploy them for you. 

1. Instructor is installing the netlify cli (command line version) -- but you can also just drag and drop the web folder into netlify for a manual deploy. If you really want to use the command line method then:

    `cd web`

    `yarn add netlify-cli --dev`

1. Note: you can get this thing called [hub](https://github.com/github/hub) from github which allows you command line powers to create new repos (as opposed to signing into github on the website and using their interface)

1. If you're deploying to netlify using the from github approach, it will need to be configured a little. Most of that should be self explanatory (just follow the instructions) but below are some things to note:

    build commands:

    `cd web && npm install && npm run build`

    publish directory:

    `web/build`

1. Inspect the cloud based terminal on netlify for your project and you should hopefully see 'site is live' at the bottom after a successful deployment.

1. In deploy settings you can customise the deployment a little, like customise the site name. 

1. [As per the netlify docs](https://www.netlify.com/docs/redirects/#history-pushstate-and-single-page-apps), you need to have a _redirects file within the /web/ folder , add this line to that file:

    `/*  /index.html 200`

    then copy that _redirects file into the /web/build folder, so that it's now in both

    What that does is it redirects any subdomain path entered by the user back to the index.html page, so when a user enters for example yarra.netlify.com/products. it doesn't look for an actual products page, it just directs it back to the same index.html file of the site. At that point React takes over and changes what is displayed based on the url entered.

1. Go to scripts and add the following script:

    `"build":"react-scripts build && cp _redirects build/_redirects",`

    because the build process replaces the whole build folder, which will blow away our _redirects file
