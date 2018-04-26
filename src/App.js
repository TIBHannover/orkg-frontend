import React, {Component} from 'react';
import './App.css';
import DataList from './components/DataList';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.url = 'http://localhost:8000/api/statements/';

        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
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

    render() {
        if (!(this.state.error || this.state.results)) {
            return (<p>Loading...</p>);
        }
        if (this.state.error) {
            return (<p><strong>Error:</strong> {this.props.error} </p>);
        }

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Research contribution</h1>
                </header>

                <DataList data={this.state.results}/>
            </div>
        );
    }
}

export default App;
