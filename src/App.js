import React, {Component} from 'react';
import './App.css';
import Content from './Content';
import ContentItem from './ContentItem';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
        }

        this.url = 'http://localhost:8889/bigdata/sparql';

        this.createRandomId = this.createRandomId.bind(this);
        this.randomString = this.randomString.bind(this);
        this.setState = this.setState.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
//        let query = `
//                prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
//                prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//                prefix : <http://uni-hannover.de/knowledge-graph/ontologies/research-paper#>
//
//                select ?researchTitle ?problemLabel ?approachLabel ?scalabilityLabel ?implementationLabel ?plLabel ?evaluationLabel
//                        ?datasetLabel ?benchmarkLabel
//                where {
//                    ?researchContribution rdf:type :ResearchContribution ;
//                        rdfs:label ?researchTitle ;
//                        :addresses ?problem ;
//                        :followsApproach ?approach .
//                    ?problem rdfs:label ?problemLabel .
//                    ?approach :hasScalability ?scalability ;
//                        rdfs:label ?approachLabel ;
//                        :hasImplementation ?implementation ;
//                        :evaluatedBy ?evaluation .
//                    ?scalability rdfs:label ?scalabilityLabel
//                    optional {
//                        ?implementation :usesPl ?pl ;
//                            rdfs:label ?implementationLabel .
//                        ?pl rdfs:label ?plLabel .
//                        ?evaluation :usesDataset ?dataset ;
//                            rdfs:label ?evaluationLabel .
//                        ?dataset rdfs:label ?datasetLabel .
//                        ?evaluation :followsBenchmark ?benchmark .
//                        ?benchmark rdfs:label ?benchmarkLabel .
//                    }
//                }`;
//        let query = 'select * where {?s ?p ?o} limit 1';
        let query = `
            prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            prefix swrc: <http://swrc.ontoware.org/ontology#>
            prefix ub: <http://vocab.cs.uni-bonn.de/unistruct#>
            prefix dc: <http://purl.org/dc/elements/1.1/>
            prefix : <http://uni-hannover.de/knowledge-graph/ontologies/research-paper#>

            select ?articleLabel ?articleCreator
            where {
                ?article rdf:type swrc:Article ;
                        rdfs:label ?articleLabel ;
                        dc:creator ?articleCreator .
            }`;

        var that = this;

        return fetch(this.url, {
                method: 'POST',
                body: 'query=' + query,
                headers: {
                    'Accept': 'application/sparql-results+json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                }
            })
            .then((response) => {
                console.log('Response type: ' + response.type);
                return response.json();
            })
            .then((responseJson) => {
                that.setState({
                    results: responseJson.results,
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

        let query = `
                prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
                prefix : <http://uni-hannover.de/knowledge-graph/ontologies/research-paper#>

                insert data {
                    ` + this.createRandomId() + ` rdf:type :ResearchContribution ;
                    rdfs:label ` + formData.researchTitle + ` .
                }
        `;

        alert('query = ' + query);

        event.preventDefault();
    }

    createRandomId() {
        return 'OWLNamedIndividual_' + this.randomString(20);
    }

    randomString(length) {
        var chars = '0123456789'.split('');

        if (!length) {
            length = Math.floor(Math.random() * chars.length);
        }

        let str = '';
        for (let i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }

    handleChange(e) {
        this.setState({[e.target.name]: e.target.value});
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">Research contribution</h1>
                </header>
                <Content results={this.state.results} error={this.state.error} onChange={this.handleChange}/>
                <form onSubmit={this.handleSubmit}>
                    <ContentItem editable={true}/>
                    <input type="reset" value="Reset"/>
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        );
    }
}

export default App;
