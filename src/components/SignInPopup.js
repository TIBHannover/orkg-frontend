import React, {Component} from 'react';

export default class SignInPopup extends Component {

    render() {
        return <div className="dropdown-menu dropdown-menu-right" style={{position: 'absolute'}}>
            <form className="px-4 py-3">
                <div className="form-group">
                    <label htmlFor="signInDropdownFormEmail">Email address</label>
                    <input type="email" className="form-control" id="signInDropdownFormEmail"
                            placeholder="email@example.com"/>
                </div>
                <div className="form-group">
                    <label htmlFor="signInDropdownFormPassword">Password</label>
                    <input type="password" className="form-control" id="signInDropdownFormPassword"
                            placeholder="Password"/>
                </div>
                <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="dropdownCheck"/>
                    <label className="form-check-label" htmlFor="dropdownCheck">Remember me</label>
                </div>
                <button type="submit" className="btn btn-primary">Sign in</button>
            </form>
            <div className="dropdown-divider"/>
            <a className="dropdown-item" href="/">New around here? Sign up</a>
            <a className="dropdown-item" href="/">Forgot password?</a>
            <div className="overlay" onClick={this.props.onOverlayClick}/>
        </div>
    }

}