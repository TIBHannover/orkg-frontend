import React, {Component} from 'react';
import './App.css';
import DataList from './components/DataList';
import Graph from 'vis-react';
import {Button, Container, Form, Modal, Icon, Segment, Grid, TextArea, Input, Label} from 'semantic-ui-react';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.url = 'http://localhost:8000/api/statements/';

        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.buildGraph = this.buildGraph.bind(this);
    }

    componentDidMount() {
        var that = this;

        return fetch(this.url + 'resources/', {
                method: 'GET',
            })
            .then((response) => {
                console.log('Response type: ' + response.type);
                return response.json();
            })
            .then((responseJson) => {
                that.setState({
                    results: responseJson,
                });
            })
            .catch((err) => {
                console.error(err);
                that.setState({
                    error: err.message,
                });
            });
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
                label: this.cropText(value.value),
                scaling: {
                    label: {
                        enabled: true,
                    },
                },
                shape: 'circle',
                size: '30px',
                title: value.value
            });

            const propertiesContent =  Object.entries(value).filter(
                (entry) => !(entry[0] in ignoredProperties) && entry[1] instanceof Array
            );

            if (propertiesContent.length > 0) {
                propertiesContent.forEach(
                    (value, index) => {
                        const subgraph = this.buildGraph(value[1]);
                        const newEdges = subgraph.nodes.map((node, index) => {
                            return {
                                from: nodeId,
                                to: node.id,
                                label: this.cropText(value[0]),
                                title: value[0]
                            };
                        });

                        graph.nodes = graph.nodes.concat(subgraph.nodes);
                        graph.edges = graph.edges.concat(subgraph.edges).concat(newEdges);
                    }
                );
            }
        });

        return graph;
    }

    onNodeSubmitClick(event, data) {
//        const id = this.createRandomId();

    }

//    createRandomId() {
//        return this.randomString(8);
//    }
//
//    randomString(length) {
//        var chars = '0123456789'.split('');
//
//        if (!length) {
//            length = Math.floor(Math.random() * chars.length);
//        }
//
//        let str = '';
//        for (let i = 0; i < length; i++) {
//            str += chars[Math.floor(Math.random() * chars.length)];
//        }
//        return str;
//    }

    render() {
        if (!(this.state.error || this.state.results)) {
            return (<p>Loading...</p>);
        }
        if (this.state.error) {
            return (<p><strong>Error:</strong> {this.props.error} </p>);
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
                <Graph graph={graph} options={options} events={events}/>
                <header className="App-header">
                    <h1 className="App-title">Research contribution <Button>+</Button></h1>
                </header>

                <DataList data={this.state.results}/>
            </div>
        );
//        Add node
//                        <Form>
//                            <Form.Field>
//                                <input placeholder='Node Name'/>
//                            </Form.Field>
//                            <Button onClick={this.onNodeSubmitClick}>Submit</Button>
//                        </Form>
//
//                        Add link
//                        <Form>
//                            <Form.Field>
//                                <input placeholder='Subject'/>
//                            </Form.Field>
//                            <Form.Field>
//                                <input placeholder='Predicate'/>
//                            </Form.Field>
//                            <Form.Field>
//                                <input placeholder='Object'/>
//                            </Form.Field>
//                            <Button type='submit'>Submit</Button>
//                        </Form>
    }
}

export default App;
