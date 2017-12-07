import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import SignInForm from './components/SignInForm'
import { signIn } from './api/auth'
import { listProducts } from './api/products';
import {setToken} from './api/init'

class App extends Component {

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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Lake Disappointment</h1>
        </header>
        <p className="App-intro">
          Now delivering, shipping millions of new products
        </p>
        <SignInForm
          onSignIn = {this.onSignIn}
        />
      </div>
    );
  }

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
}

export default App;
