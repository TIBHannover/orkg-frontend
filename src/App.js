import React, {Component} from 'react';
import './App.css';
import DataList from './components/DataList';
import Graph from 'vis-react';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.url = 'http://localhost:8000/api/';

        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        var that = this;

        return fetch(this.url + 'contributions/', {
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

    render() {
        if (!(this.state.error || this.state.results)) {
            return (<p>Loading...</p>);
        }
        if (this.state.error) {
            return (<p><strong>Error:</strong> {this.props.error} </p>);
        }

        var graph = {
          nodes: [
              {id: 1, label: 'Node 1'},
              {id: 2, label: 'Node 2'},
              {id: 3, label: 'Node 3'},
              {id: 4, label: 'Node 4'},
              {id: 5, label: 'Node 5'}
            ],
          edges: [
              {from: 1, to: 2},
              {from: 1, to: 3},
              {from: 2, to: 4},
              {from: 2, to: 5}
            ]
        };

        var options = {
            layout: {
                hierarchical: true
            },
            edges: {
                color: "#000000"
            }
        };

        var events = {
            select: function(event) {
                var { nodes, edges } = event;
            }
        }

        return (
            <div className="App">
                <Graph graph={graph} options={options} events={events}/>
                <header className="App-header">
                    <h1 className="App-title">Research contribution</h1>
                </header>

                <DataList data={this.state.results}/>
            </div>
        );
    }
}

export default App;
