import React, { Component } from 'react'
import { connect } from 'react-redux'
import firebase from 'firebase'

//import PropTypes from 'prop-types'

import {
  Route,
  Redirect,
  withRouter
} from 'react-router-dom'

/**
 * Component that protects route from unauthorized users.
 * @type {Object}
 */
class PrivateRoute extends Component{
  render(){
    const { component: Component, requiredUserType, userPermissions, ...rest } = this.props
    //This catches the infinite loop and warning I was getting from the animation.
    if (rest.location.pathname === '/signIn'){ return null } 

    if (firebase.auth().currentUser){
      if (requiredUserType){
        if (userPermissions[requiredUserType]){
          return <Route {...rest} render={ props => <Component {...props}/> }/>
        }
        return <Route {...rest} render={ () => <Redirect to={{ pathname: '/portal/403' }} /> }/>
      }
      return <Route {...rest} render={ props => <Component {...props}/> }/>
    }
    return <Route {...rest} render={ props => <Redirect to={{ pathname: '/signIn', state: { from: props.location } }}/> }/>
  }
}

PrivateRoute.propTypes = {}

PrivateRoute.defaultProps = {}

const mapStateToProps = (state) => {
  const { userPermissions } = state.Auth
  return { userPermissions }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute))
