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
        ...
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
    ...
    server.use(cors()) //Allow other origins to access us (ie react frontend)
    ```
1. Now at the state where a valid login will recieve a valid JWT. Now how to make it so that the frontend browser makes use of that when requesting subsequent pages
1. Referring to the axios docs, you can pass in headers, like the bearer [token] one used in the check.http
1. But we are wanting to change the defaults so that any future axios requests will have that header in place.
1. We can just use one line like 'ourinstance.common.headers...'
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
1. At this point the instructor saw that we were saving the token AND setting the headers so decided to move some logic out of the auth.js file and into the init.js file...

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

# Instructors solutions to the challenges:
## listing the products
if we're signed in, list the products

otherwise set the state's products list to null.

that was put in a 'load()' method

how to detect when they click sign out? apparently this.setstate is asynchronous
the second argument to setState is a callback function once setState is finished.

but instead
he uses componentDidUpdate and then in there compares the decodedToken to the prevState's decodedToken and if it's changed then runs the load method.

(in the screen recording he's running through how the internals of the setState method works)

## form to create new products

similar pattern to the signup form.

now how to update the state to include the newly created product

uses this.setState to concat the new product onto the existin product array.

when creation happens, response from backend should spit back the newly saved document from the db.  including the db _id. in this way the frontend then has this information so that if it wants to make a subsequent request in relation to that item, it has the _id to use to identify which one it's talking about to the server.

## updating a product

a good amazing cheatsheet mongoose vs active record (from his coder academy patterns github)

he's using the findOneAndUpdate(conditions, changes, {new: true, runValidators: true})

the {new: true, runValidators: true} is to override the mongoose defaults 
new: true => Please return to us the NEW product
runValidators => self explanatory

he adds that to the backend code in a new route: put /products/:id

(you can refer to his git commits for step by step code changes)

He wanted to have a single product form that could be used for both creating and editing.

he handles the difference between the two cases with props. he changes the title of the form using a prop so the caller can decide. and he runs a generic 'onSubmit' that is also passed by the caller so the caller can handle what to do with the data depending on use case.

### doing the edit form for updating products

in the components/Product.js

he adds an onEdit command in an onClick on the div of an individual proudct listing.
the product list he has as its own component

the individual product component's responsibility: I'll let you know when I'm clicked
the product list component's responsibility: I'll let you know which one was clicked.

**Note: if you need to wrap multiple elements in a div because it's in a javascript return statement, but you don't actually want a div, use the fragment element**

clicking on a product then has the effect of setting a value in the state called activeProductId and this gets set to the id of the product that was clicked.

in order to get the product edit form to render when a product was clicked, the productList component has a prop called renderEditForm(product) which is a function passed to it by the parent calling function (as an arrow function)

to then used .map to find the product in the list that was updated, and if it was it gets replaced with the updated version.

and then finally sets the states activeProductId back to null.

# following along to make a wishlist functionality where users can maintain a wishlist of products (demonstrates how to manage database relationships)

1. create a new model called wishlist initially a copy paste of the models/product.js code
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

1. next up is routes for the wishlist:

    copy the products routes file and then edit it to change it to be about wishlists with a couple tweaks:
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
1. we changed it to error code 500 for internal server error as it wouldn't be the users fault in this case.
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
    remember to add require('./routes/wishlists'), to your server.use array in server.js

1. now make a test GET method in the check.http file, but first you will have to make the post request to authenticate so you can grab a copy of the token then you can make a post request like this:
    ```
    ###

    GET http://localhost:7000/wishlist
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o
    ###
    ```

1. make the wishlist return the products in itself:

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

1. and return an empty array otherwise:
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

1. moving onto handling the post from a user to add a product to the wishlist:

    ```javascript

    router.post('/wishlist/products/:productID', (req, res) => {
      const { productID } = req.params
      
    })
    ```
 
1. going to use the findOneAndUpdate to make the update.

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
1. Add the code to make the change for us using $addToSet
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

    ```
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

1. now to add a test to your check.http with a valid and invalid product id.

    and you can see that the check will fail if we pass as an id 'robot' but it will pass if we pass what looks like a valid id: 
    below the one ending in 222 doesn't correspond to anything in the database but that request is still honored.
    ```

    POST http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d222
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o

    ###

    POST http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d16b
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o

    ###
    ```

1. the opposite of $addToSet is $pull, needed for removing products from the wishlist.

    then to implement that functionality we basically copy and paste what we wrote for adding and then change the operator from $addToSet to $pull and change the http verb to delete:

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

1. then test in your check.http file :

    ```
    ###

    DELETE http://localhost:7000/wishlist/products/5a28c10a1b6bcd3dcb60d16b
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQG1haWwuY29tIiwiaWF0IjoxNTEyNjk0NjY1LCJleHAiOjE1MTMyOTk0NjUsInN1YiI6IjVhMjhkOWI2M2EwYmVhM2U4ZGUzZjljZiJ9.eCTl5CxCWaSYoHwipnmrcZ6fQf2jAvNaVUuDpE8eU6o
    ```

1. Now as it is, the response for the wishlist is just an array of product ids. but it would be nicer if it responded with the actual products.

    We can make that happen easily with the populate method, inserted into our get wishlist router code:

    ```javascript
    router.get('/wishlist', requireJWT, (req, res) => {
      
      // from https://github.com/Coder-Academy-Patterns/mongoose-vs-activerecord
      Wishlist.findOne({user: req.user })
      .populate('products')
      .then((wishlist) => {
        if (wishlist) {
    ...
    ```

    That's just for the router.get, but regarding .post and .delete, you can also make them respond in the same way by adding the same line just before their .then lines as we did above.
