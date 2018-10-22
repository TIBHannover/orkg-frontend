import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import './App.css';
import {Link, Redirect, Route, Switch} from 'react-router-dom';
import ResourceDetails, {descriptionSection} from './pages/ResourceDetails'
import PredicateDetails from './pages/PredicateDetails'
import Resources from './pages/Resources'
import {NotificationContainer} from 'react-notifications';
import AddResource from './pages/AddResource';
import Predicates from './pages/Predicates';
import SignInPopup from './components/SignInPopup';

export default class App extends Component {

    state = {
        signInVisible: false,
    };

    toggleSignInVisibility = () => {
        this.setState({signInVisible: !this.state.signInVisible});
    };

    handleOverlayClick = () => {
        this.setState({signInVisible: false});
    };

    render() {
        return <div className="body">
            <NotificationContainer/>
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
                <Link className="navbar-brand col-sm-3 col-md-2 mr-0" to="#">ORKG</Link>
                <input className="form-control form-control-dark w-100" type="text" placeholder="Search (not implemented)"
                       aria-label="Search"/>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap dropdown show">
                            <a className="nav-link btn btn-secondary dropdown-toggle" href="#"
                                    aria-haspopup="true" onClick={this.toggleSignInVisibility}>Sign in</a>
                            {this.state.signInVisible && <SignInPopup onOverlayClick={this.handleOverlayClick}/>}
                        </li>
                    </ul>
            </nav>

            <div className="body-content container-fluid">
                <div className="row entityView">
                    <Nav className="bg-light col-md-3 col-lg-2" vertical>
                        <NavItem>
                            <NavLink><Link to={`${process.env.PUBLIC_URL}/`}>Research contributions</Link></NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink>
                                <Link to={`${process.env.PUBLIC_URL}/addResource`}>Add research contribution</Link>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href={`${process.env.PUBLIC_URL}/predicates`}>Predicates</NavLink>
                        </NavItem>
                    </Nav>

                    <main role="main" className="col-md-9 col-lg-10 pt-3 px-4">
                        <Switch>
                            <Route exact path={`${process.env.PUBLIC_URL}/`} component={Resources}/>
                            <Route exact path={`${process.env.PUBLIC_URL}/addResource`} component={AddResource}/>
                            <Route exact path={`${process.env.PUBLIC_URL}/predicates`} component={Predicates}/>
                            <Route path={`${process.env.PUBLIC_URL}/resource/:resourceId/:sectionName`}
                                render={({match}) => (
                                    <ResourceDetails {...this.props} id={decodeURIComponent(match.params.resourceId)}
                                            sectionName={decodeURIComponent(match.params.sectionName)}/>
                                )}/>
                            <Route path={`${process.env.PUBLIC_URL}/predicate/:predicateId`} render={({match}) => (
                                <PredicateDetails id={decodeURIComponent(match.params.predicateId)}/>
                            )}/>
                            <Redirect from={`${process.env.PUBLIC_URL}/resource/:resourceId`}
                                to={'/resource/:resourceId/' + descriptionSection}/>
                        </Switch>
                    </main>
                </div>
            </div>
        </div>
    }
}
