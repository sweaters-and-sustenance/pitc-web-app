import React, { Component } from 'react';
import './App.css';
import MarkerExplorer from './MarkerExplorer'
import { Modal } from 'react-bootstrap'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  userLogin,
  userLogout,
  userSignup
} from './actions'
import {
  FEATURE_FLAGS
} from './constants'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingLogin: false,
      email: null,
      password: null
    }
    this.openLogin = this.openLogin.bind(this);
    this.closeLogin = this.closeLogin.bind(this);
    this.login = this.login.bind(this);
    this.myAccount = this.myAccount.bind(this);
    this.signup = this.signup.bind(this);
  }

  openLogin() {
    this.setState({ showingLogin: true });
  }

  closeLogin() {
    this.setState({ showingLogin: false });
  }

  login() {
    this.props.userLogin({
      email: this.state.email,
      password: this.state.password
    })
  }

  signup() {
    this.props.userSignup({
      email: this.state.email,
      password: this.state.password
    })
  }

  myAccount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.token !== this.props.user.token && nextProps.user.token !== null) {
      this.setState({ showingLogin: false });
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-fixed-top">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href="/">
                <img src="/logo.png" alt="Logo" className="sas-logo" />
              </a>
            </div>
            { FEATURE_FLAGS.USER_ACCOUNT ?
              <div className="navbar-form navbar-right">
                { this.props.user.token == null ?
                  <button onClick={this.openLogin} className="btn btn-primary">Login</button> :
                  <span>
                    <button onClick={this.props.myAccount} className="btn btn-info">My Account</button>&nbsp;
                    <button onClick={this.props.userLogout} className="btn btn-warning">Logout</button>
                  </span>
                }
              </div> : null }
          </div>
        </nav>
        <MarkerExplorer />
        { FEATURE_FLAGS.USER_ACCOUNT ?
          <Modal show={this.state.showingLogin && this.props.user.token == null} onHide={this.closeLogin}>
            <Modal.Header closeButton>
              <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              { this.props.user.error ? <div className="alert alert-success">{this.props.user.error}</div> : null }
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" onChange={(event) => this.setState({email:event.target.value})} />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control"  onChange={(event) => this.setState({password:event.target.value})} />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button onClick={this.signup} className="btn btn-primary">Signup</button>
              <button onClick={this.login} className="btn btn-default">Login</button>
            </Modal.Footer>
          </Modal> : null }
      </div>
    );
  }
}

const stateToProps = (state) => {
  return {
    user: state.user
  }
}

const dispatchToProps = (dispatch) => {
  return bindActionCreators({
    userLogin,
    userLogout,
    userSignup
  }, dispatch)
}

export default connect(stateToProps, dispatchToProps)(App)
