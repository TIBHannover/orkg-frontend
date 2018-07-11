import React, {Component} from 'react';
import './App.css';
import DataList from './components/DataList';
import Graph from 'vis-react';
import {Button, Container, Form, Modal, Icon, Segment, Grid, TextArea, Input, Label} from 'semantic-ui-react';
import SplitPane from 'react-split-pane';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allResources: null,
            allStatements: null,
            results: null,
            error: null,
        }

        this.url = 'http://localhost:8000/api/statements/';

        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.buildGraph = this.buildGraph.bind(this);
        this.onSearchClick = this.onSearchClick.bind(this);
        this.getAllResources = this.getAllResources.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
    }

    componentDidMount() {
        this.getAllResources();
        this.getAllStatements();

        window.addEventListener("hashchange", this.handleHashChange);
        this.handleHashChange();
    }

    /**
     * Sends simple GET request to the URL.
     */
    submitGetRequest(url, onSuccess, onError) {
        fetch(url, { method: 'GET' })
                .then((response) => {
                    console.log('Response type: ' + response.type);
                    if (!response.ok) {
                        throw {message: 'Error response. (' + response.status + ') ' + response.statusText};
                    } else {
                        return response.json();
                    }
                })
                .then(onSuccess)
                .catch(onError);
    }

    handleHashChange() {
        const that = this;
        const hash = window.location.hash;

        if (hash) {
            if (hash.startsWith('#q=')) {
                const queryUrl = this.url + 'resources/?' + hash.substring(1);
                this.submitGetRequest(queryUrl,
                        (responseJson) => {
                            that.setState({
                                results: responseJson,
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
                const queryUrl = this.url + 'resources/' + hash.substring(4);
                this.submitGetRequest(queryUrl,
                        (responseJson) => {
                            that.setState({
                                results: [responseJson],
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

    buildGraph(array) {
        /* Name of the ID property. */
        const idPropertyName = 'id';

        /* Name of the property that should be displayed as text. */
        const displayPropertyName = 'value';

        /* Hidden properties. */
        const ignoredProperties = [idPropertyName, displayPropertyName];

        const graph = {nodes: [], edges: []};

        array.forEach((value, index) => {
            const nodeId = value.id;
            graph.nodes.push({
                id: nodeId,
                label: this.cropText(value.label),
                scaling: {
                    label: {
                        enabled: true,
                    },
                },
                shape: 'circle',
                size: '30px',
                title: value.label
            });
        });

        const statements = this.state.allStatements;
        statements.forEach((value, index) =>{
            if (value.object.type === 'resource') {
                graph.edges.push({
                    from: value.subject,
                    to: value.object.id,
                    // TODO: fetch the text of the predicate.
                    label: this.cropText(value.predicate)
                });

            }
        });

        return graph;
    }

    onSearchClick(event, data) {
        window.location.hash = 'q=' + encodeURIComponent(this.refs.searchText.value.trim());
    }

    getAllResources() {
        const that = this;

        this.submitGetRequest(this.url + 'resources/',
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

    getAllStatements() {
        const that = this;

        this.submitGetRequest(this.url,
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
                            <input ref="searchText" defaultValue={hash && hash.startsWith('#q=')
                                    ? decodeURIComponent(window.location.hash.substring(3)) : null}/>
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

        const graph = this.buildGraph(this.state.results);

        const options = {
            autoResize: true,
            edges: {
                color: "#000000"
            },
            height: '500px',
        };

        const events = {
            select: function(event) {
                var { nodes, edges } = event;
            }
        }

        return (
            <div className="App">
                {searchForm}
                <SplitPane split="vertical" minSize={250} defaultSize={800}>
                    <div><Graph graph={graph} options={options} events={events}/></div>
                    <div>
                        <header className="App-header">
                            <h1 className="App-title">Results <Button>+</Button></h1>
                        </header>
                        <DataList data={this.state.results} allResources={this.state.allResources} level={0}/>
                    </div>
                </SplitPane>
            </div>
        );
    }
}

export default App;
