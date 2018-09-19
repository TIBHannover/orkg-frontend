import React, {Component} from 'react';
// import DataList from './components/DataList';
// import AddResourceModal from './components/AddResourceModal';
// import Graph from 'vis-react';
import {
    Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown, Card, CardImg,
    CardBody, CardTitle, CardSubtitle, CardText, CardGroup, CardHeader, UncontrolledCollapse, Nav, NavItem, NavLink
} from 'reactstrap';
// import SplitPane from 'react-split-pane';
// import {NotificationContainer} from 'react-notifications';
import {submitGetRequest, url} from './helpers.js';
import './App.css';
import CodeContainer from "./components/CodeContainer";
import StatementGroupCard from "./components/statements/StatementGroupCard";
import Statement from "./components/statements/Statement";
import {BrowserRouter as Router, Route, Link, Switch} from "react-router-dom";
import ContributionDetails from "./components/pages/ContributionDetails"
import Contributions from "./components/pages/Contributions"
import {NotificationContainer} from "react-notifications";

class App extends Component {
    state = {
        allResources: null,
        allStatements: null,
        allPredicates: [],
        results: null,
        error: null,
        dropdownOpen: false,
        problemText: '',
    };

    query = '';

    constructor(props) {
        super(props);

        this.setState = this.setState.bind(this);
        this.toggle = this.toggle.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.findAllStatements = this.findAllStatements.bind(this);
        this.findAllPredicateNames = this.findAllPredicateNames.bind(this);
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

    componentDidMount() {
        this.findAllStatements();
        this.findAllPredicateNames();

        window.addEventListener("hashchange", this.handleHashChange);
        this.handleHashChange();
    }

    // TODO: Run this after all queries completed.
    findAllPredicateNames(predicateIds) {
        const that = this;
        submitGetRequest(url + 'predicates/', (responseJson) => {
            that.setState({
                allPredicates: responseJson,
                error: null
            });
        },
        (err) => {
            console.error(err);
            that.setState({
                allPredicates: [],
                error: err.message,
            });
        });
    }

    handleHashChange() {
        const that = this;
        const hash = window.location.hash;

        if (hash) {
            if (hash.startsWith('#q=')) {
                const queryUrl = url + 'resources/?' + hash.substring(1);
                submitGetRequest(queryUrl,
                        (responseJson) => {
                            const results = responseJson.map(item => {
                                return {
                                    statementId: null,
                                    predicateId: null,
                                    resource: item
                                }
                            });
                            that.setState({
                                results: results,
                                error: null
                            });
                        },
                        (err) => {
                            console.error(err);
                            that.setState({
                                results: null,
                                error: err.message,
                            });
                        });
            } else if (hash.startsWith('#id=')) {
                const queryUrl = url + 'resources/' + hash.substring(4);
                submitGetRequest(queryUrl,
                        (responseJson) => {
                            const results = {
                                statementId: null,
                                predicateId: null,
                                resource: responseJson
                            };
                            that.setState({
                                results: [results],
                                error: null
                            });
                        },
                        (err) => {
                            console.error(err);
                            that.setState({
                                results: null,
                                error: err.message,
                            });
                        });
            } else {
                const errMsg = 'Incorrect hash value.';
                console.error(errMsg);
                that.setState({
                    results: null,
                    error: errMsg,
                });
            }
        }
    }

    handleSubmit(event) {
        // TODO: should we use state in this component or should we access form data?
        const formData = {};
        for (const field in this.refs) {
            formData[field] = this.refs[field].value;
        }

        event.preventDefault();
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    cropText(s) {
        const maxSize = 15;
        if (!s) {
            return null;
        }
        return (s.length <= maxSize) ? s : s.substring(0, maxSize - 3) + '...';
    }

    onSearchClick(event, data) {
        window.location.hash = 'q=' + encodeURIComponent(this.query);
    }

    findAllStatements() {
        const that = this;

        submitGetRequest(url + 'statements/',
                (responseJson) => {
                    that.setState({
                        allStatements: responseJson,
                        error: null,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        allStatements: null,
                        error: err.message,
                    });
                });
    }

    render() {
        return <div>
            <NotificationContainer/>
            <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
                <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">ORKG</a>
                <input className="form-control form-control-dark w-100" type="text" placeholder="Search (not implemented)"
                       aria-label="Search"/>
                    <ul className="navbar-nav px-3">
                        <li className="nav-item text-nowrap">
                            <a className="nav-link" href="#">Sign in (not implemented)</a>
                        </li>
                    </ul>
            </nav>

            <div className="container-fluid">
                <div className="row">
                    <Nav className="bg-light" vertical>
                        <NavItem>
                            <NavLink><Link to="/">Research contributions</Link></NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink><Link to="/contribution">Research contribution</Link></NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="/#/researchContributions/">Approaches</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Implementations</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Evaluations</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink href="#">Etc</NavLink>
                        </NavItem>
                    </Nav>

                    <main role="main" className="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
                        <Switch>
                            <Route exact path="/" component={Contributions}/>
                            <Route path="/contribution/:contributionId" render={({ match }) => (
                                <ContributionDetails id={decodeURIComponent(match.params.contributionId)}/>
                            )}/>
                        </Switch>
                    </main>
                </div>
            </div>
        </div>
    }
}

export default App;
