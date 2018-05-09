import React, {Component} from 'react';
import './App.css';
import DataList from './components/DataList';
import Graph from 'vis-react';
import {Form, Button} from 'semantic-ui-react';

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

        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Research contribution</h1>
                </header>

                <DataList data={this.state.results}/>
                Add node
                <Form>
                    <Form.Field>
                        <input placeholder='Node Name'/>
                    </Form.Field>
                    <Button onClick={this.onNodeSubmitClick}>Submit</Button>
                </Form>

                Add link
                <Form>
                    <Form.Field>
                        <input placeholder='Subject'/>
                    </Form.Field>
                    <Form.Field>
                        <input placeholder='Predicate'/>
                    </Form.Field>
                    <Form.Field>
                        <input placeholder='Object'/>
                    </Form.Field>
                    <Button type='submit'>Submit</Button>
                </Form>
            </div>
        );
    }
}

export default App;
