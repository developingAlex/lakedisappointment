import React, { Component, Fragment } from 'react';
// import logo from './logo.svg';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
// import  {browserHistory} from 'react-router' //for redirecting to /products upon successful sign in //no browserHistory export from react-router
import './App.css';
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import Wishlist from './components/Wishlist'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import PrimaryNav from './components/PrimaryNav'
import { signIn, signUp, signOutNow } from './api/auth'
import { 
  listProducts, 
  listWishlistProducts, 
  createProduct, 
  addProductToWishlist,
  removeProductFromWishlist
} from './api/products';
// import {setToken} from './api/init'
import {getDecodedToken} from './api/token'

class App extends Component {

  state = {
  
    decodedToken: getDecodedToken(),
    products: null,
    wishListProducts: null,
    productCreated: false
  }
  
  onCreateProduct = ( productData) => {
    createProduct(productData)
      .then((newProduct)=>{
        console.log('successfully created new product', newProduct)
        this.setState({productCreated: true})
        this.load()
      })
      .catch((error) => {
        console.error('There was an error trying to create the new product: ', error.message)
      })
  }

  onSignIn = ({email, password})=>{
    console.log('App received', {email, password})
    
    signIn({email, password})
    .then((decodedToken) => {
      console.log('Signed in:',decodedToken)
      this.setState({decodedToken})
      this.load()
      // window.location.href = ('/products'); //not-optimal UX, 
      // window.location.replace('/products'); //not-optimal UX, 
      // browserHistory.push('/products') // no browserHistory export from react-router
      // this.render()(<Redirect to='/products' />) //doesn't work.
      //correct way is to add a ternary based on whether the user is signed in, into the rend part when the route is 'signin', seamless!
    })
  }
    
  onSignUp = ({firstname, lastname, email, password}) => {
    signUp({firstname, lastname, email, password})
    .then((decodedToken) => {
      console.log('Signed up:', decodedToken)
      this.setState({decodedToken})
      this.load()
    })
  }

  onSignOut = () => {
    signOutNow()
    this.setState({ decodedToken: null, products: null})
    this.load()
  }

  onAddProductToWishlist = (productId) => {
    addProductToWishlist(productId)
    .then ((res) => {
      console.log(res)
      this.load()
    })
    .catch ((error) => {
      console.error(`There was an error attempting to add the the product with id ${productId} to your wishlist:`, error.message)
    })
  }

  onRemoveProductFromWishlist = (productId) => {
    removeProductFromWishlist(productId)
    .then((res) =>{
      console.log(res)
      this.load()
    })
    .catch((error) =>{
      console.error(`There was an error attempting to remove the the product with id ${productId} from your wishlist:`, error.message)
    })
  }

  acknowledgeProductCreated = () => {
    const {productCreated} = this.state
    if (productCreated) {
      this.setState({productCreated: false})
    }
  }
  render() {
    const { decodedToken, products, wishListProducts, productCreated } = this.state
    const signedIn = !!decodedToken
    
    const requireAuth = (render) => (props) =>(
      signedIn ? (
        render()
      ) : (
        <Redirect to='/signin' />
      )
    )
    console.log("wishlistProducts from app.js:", wishListProducts)
    return (
      <Router>
        <div className="App">
        <PrimaryNav
          signedIn = {signedIn}
          />
          <Route path='/' exact render = {() => (
            <Fragment>
              <header className="App-header">
                <h1 className="App-title">Welcome to Lake Disappointment</h1>
              </header>
              <p className="App-intro">
                Where the shipping is free, the prices are cheap and the quality cheaper! now shipping millions of mundane products!
              </p>
            </Fragment>
          ) } />
          <Route path='/signin' exact render = {()=>(
            signedIn ? (
              <Redirect to='/products' />
            ) : (
              <Fragment>
                <SignInForm
                  onSignIn = { this.onSignIn }
                />
              </Fragment>
            )
          ) } />
          <Route path='/signup' exact render = {()=>(
            signedIn ? (
              <Redirect to='/products' />
            ) : (
              <Fragment>
                <SignUpForm
                  onSignUp = { this.onSignUp }
                />
              </Fragment>
            )
          ) } />
          <Route path='/products' exact render = {()=>(
            <Fragment>
            {this.acknowledgeProductCreated()}
              <ProductList
                { ...products }
                signedIn={ signedIn }
                wishlistProducts={ wishListProducts }
                onAddProductToWishlist={this.onAddProductToWishlist}
                onRemoveProductFromWishlist={this.onRemoveProductFromWishlist}
                 
              />
            </Fragment>
          ) } />
          <Route path='/admin/products' exact render = {requireAuth(()=>(
            <Fragment>
              { productCreated ? (
                <Redirect to='/products' />
              ):(
                <ProductForm
                  title='Enter a new product:'
                  onSave={this.onCreateProduct }
                />

              )}
            </Fragment>
          ) ) } />
          <Route path='/wishlist' exact render = {requireAuth(()=>(
            signedIn ? (
            <Fragment>
              <Wishlist
                {...wishListProducts}
              />
            </Fragment> ) : (
              <Redirect to='/signin' />
            )
          ) ) } />
          <Route path='/signout' exact render = {()=>(
            <Fragment>
              { this.onSignOut()}
              <Redirect to='/' />
            </Fragment>
          ) } />
          {
            signedIn &&
            <div className="pad-2">
              <p>Email: { decodedToken.email } </p>
              <p> Signed in at { new Date(decodedToken.iat*1000).toISOString() }</p>
              <p> session expires at { new Date(decodedToken.exp*1000).toISOString() }</p>
              <button onClick = { this.onSignOut }>
              Sign Out
              </button>
            </div>
          }
        </div>
      </Router>
    );
  }

  componentDidMount(){
    //when this app appears on screen
    this.load()
  }
  
  load(){
    listProducts()
    .then((products) => {
      this.setState({products})
    })
    .catch((error) => {
      console.error('error loading products', error.message)
    })
  
    listWishlistProducts()
    .then((wishListProducts) => {
      this.setState({wishListProducts})
    })
    .catch((error) => {
      console.error('error loading wishlist products', error.message)
    })
  }
}

export default App;
