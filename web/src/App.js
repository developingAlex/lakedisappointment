import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import { signIn, signUp, signOutNow } from './api/auth'
import { listProducts } from './api/products';
import {setToken} from './api/init'
import {getDecodedToken} from './api/token'

class App extends Component {

  state = {
    decodedToken: getDecodedToken()
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
            <div>
            <p>Email: { decodedToken.email } </p>
            <p> Signed in at { new Date(decodedToken.iat*1000).toISOString() }</p>
            <p> session expires at { new Date(decodedToken.exp*1000).toISOString() }</p>
            <button onClick = { this.onSignOut }>
            Sign Out
            </button>
            </div>
          ) : (
            <div>
              <SignInForm
                onSignIn = { this.onSignIn }
              />
              <SignUpForm
                onSignUp = { this.onSignUp }
              />
            </div>
          )

        }
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
