import React, { Component, Fragment } from 'react';
// import logo from './logo.svg';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './App.css';
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import Wishlist from './components/Wishlist'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'
import PrimaryNav from './components/PrimaryNav'
import { signIn, signUp, signOutNow } from './api/auth'
import { listProducts, listWishlistProducts, createProduct } from './api/products';
// import {setToken} from './api/init'
import {getDecodedToken} from './api/token'

class App extends Component {

  state = {
  
    decodedToken: getDecodedToken(),
    products: null,
    wishListProducts: null
  }
  
  onCreateProduct = ( productData) => {
    createProduct(productData)
      .then((newProduct)=>{
        console.log('successfully created new product', newProduct)
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
    })
  }
    
  onSignUp = ({firstname, lastname, email, password}) => {
    signUp({firstname, lastname, email, password})
    .then((decodedToken) => {
      console.log('Signed up:', decodedToken)
      this.setState({decodedToken})
    })
  }

  onSignOut = () => {
    signOutNow()
    this.setState({ decodedToken: null})
  }

  render() {
    const { decodedToken, products, wishListProducts } = this.state
    const signedIn = !!decodedToken
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
            <Fragment>
              <SignInForm
                onSignIn = { this.onSignIn }
              />
            </Fragment>
          ) } />
          <Route path='/signup' exact render = {()=>(
            <Fragment>
              <SignUpForm
                onSignUp = { this.onSignUp }
              />
            </Fragment>
          ) } />
          <Route path='/products' exact render = {()=>(
            <Fragment>
              <ProductList
                {...products}
              />
            </Fragment>
          ) } />
          <Route path='/admin/products' exact render = {()=>(
            <Fragment>
              <ProductForm
                title='Enter a new product:'
                onSave={this.onCreateProduct }
              />
            </Fragment>
          ) } />
          <Route path='/wishlist' exact render = {()=>(
            <Fragment>
              <Wishlist
                {...wishListProducts}
              />
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
