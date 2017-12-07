import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import SignInForm from './components/SignInForm'
import { signIn } from './api/auth'

class App extends Component {

  onSignIn = ({email, password})=>{
    console.log('App received', {email, password})

    signIn({email, password})
    .then((data) => {
      console.log('Signed in:',data)
      console.log({email, password})
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
}

export default App;
