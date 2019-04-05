import React, { Component } from 'react';
//import './App.css';
import { Redirect, Route, Switch } from 'react-router-dom';
import ResourceDetails, { descriptionSection } from './pages/ResourceDetails'
import PredicateDetails from './pages/PredicateDetails'
import Resources from './pages/Resources'
import SearchResults from './pages/SearchResults'
import AddResource from './pages/AddResource';
import Predicates from './pages/Predicates';
import DefaultLayout from './components/Layout/DefaultLayout';
import ROUTES from './constants/routes.js';
import AddPaper from './components/AddPaper/AddPaper'
import './assets/scss/CustomBootstrap.scss';
import 'react-notifications/lib/notifications.css';
import { ConnectedRouter } from 'connected-react-router'
import Home from './components/Home/Home';

export default class App extends Component {
    render() {
        return <ConnectedRouter history={this.props.history}>
            <DefaultLayout>
                <Switch>
                    <Route exact path={ROUTES.HOME} component={Home} />
                    <Route exact path={ROUTES.RESOURCES} component={Resources} />
                    <Route exact path={ROUTES.ADD_RESOURCE} component={AddResource} />
                    <Route exact path={ROUTES.PREDICATES} component={Predicates} />
                    <Route exact path={ROUTES.ADD_PAPER.GENERAL_DATA} component={AddPaper} />

                    <Route path={`${process.env.PUBLIC_URL}/resource/:resourceId/:sectionName`}
                        render={({ match }) => {
                            const id = decodeURIComponent(match.params.resourceId);
                            return <ResourceDetails {...this.props} id={id} key={id}
                                sectionName={decodeURIComponent(match.params.sectionName)} />
                        }} />
                    <Route path={`${process.env.PUBLIC_URL}/predicate/:predicateId`} render={({ match }) => (
                        <PredicateDetails id={decodeURIComponent(match.params.predicateId)} />
                    )} />
                    <Route path={`${process.env.PUBLIC_URL}/search/:searchTerm`} render={({ match }) => (
                        <SearchResults term={decodeURIComponent(match.params.searchTerm)} />
                    )} />

                    <Redirect from={`${process.env.PUBLIC_URL}/resource/:resourceId`}
                        to={`${process.env.PUBLIC_URL}/resource/:resourceId/${descriptionSection}`} />
                </Switch>
            </DefaultLayout>
        </ConnectedRouter>
    }
}
