import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import SignInForm from './components/SignInForm'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Lake Disappointment</h1>
        </header>
        <p className="App-intro">
          Now delivering, shipping millions of new products
        </p>
        <SignInForm/>
      </div>
    );
  }
}

export default App;
