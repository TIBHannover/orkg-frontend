import React, {Component} from 'react';
import DataList from './components/DataList';
import AddResourceModal from './components/AddResourceModal';
import {Button, Form} from 'semantic-ui-react';
import SplitPane from 'react-split-pane';
import {NotificationContainer} from 'react-notifications';
import {submitGetRequest, url} from './helpers.js';
import './App.css';

class App extends Component {
    state = {
        allResources: null,
        allStatements: null,
        allPredicates: [],
        results: null,
        error: null,
    }

    query = '';

    constructor(props) {
        super(props);

        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
        this.findAllResources = this.findAllResources.bind(this);
        this.findAllStatements = this.findAllStatements.bind(this);
        this.findAllPredicateNames = this.findAllPredicateNames.bind(this);
    }

    componentDidMount() {
        this.findAllResources();
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

    findAllResources() {
        const that = this;

        submitGetRequest(url + 'resources/',
                (responseJson) => {
                    that.setState({
                        allResources: responseJson,
                        error: null,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        allResources: null,
                        error: err.message,
                    });
                });
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
        const resultsPresent = this.state.error || (this.state.results && this.state.allResources);
        const hash = window.location.hash;
        const searchForm = (<div>
                    <header className="App-header">
                        <h1 className="App-title">Search</h1>
                    </header>
                    <Form>
                        <Form.Field>
                            <Form.Input defaultValue={hash && hash.startsWith('#q=')
                                    ? decodeURIComponent(window.location.hash.substring(3)) : null}
                                    onChange={(event, data) => this.query = data.value.trim()}/>
                            <Button onClick={this.onSearchClick}>Search</Button>
                        </Form.Field>
                    </Form>
                </div>);
        if (!resultsPresent) {
            return searchForm;
        }
        if (this.state.error) {
            return (<p><strong>Error:</strong> {this.state.error} </p>);
        }

        const options = {
            autoResize: true,
            edges: {
                color: "#000000"
            },
            height: '500px',
        };

        const events = {
            select: function(event) {
//                var { nodes, edges } = event;
            }
        }

        return <div className="App">
            <NotificationContainer/>
            {searchForm}
            <header className="App-header">
                <h1 className="App-title">Results&nbsp;<AddResourceModal/></h1>
            </header>
            <DataList data={this.state.results} allResources={this.state.allResources}
                    allPredicates={this.state.allPredicates} level={0}/>
        </div>
    }
}

export default App;
