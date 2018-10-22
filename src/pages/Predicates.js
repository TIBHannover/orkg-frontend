import React, {Component} from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import {submitGetRequest, url} from '../helpers.js';

export default class Predicates extends Component {
    state = {
        allPredicates: null,
        results: null,
        error: null,
    };

    constructor(props) {
        super(props);

        this.findAllPredicates = this.findAllPredicates.bind(this);
    }

    componentWillMount() {
        this.findAllPredicates();
    }

    findAllPredicates() {
        const that = this;

        submitGetRequest(url + 'predicates/',
            (responseJson) => {
                that.setState({
                    allPredicates: responseJson,
                    error: null,
                });
            },
            (err) => {
                console.error(err);
                that.setState({
                    allPredicates: null,
                    error: err.message,
                });
            });
    }

    render() {
        const resultsPresent = this.state.error || (/*this.state.results &&*/ this.state.allPredicates);

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const predicates = this.state.allPredicates.map(
                predicate => <ShortRecord key={predicate.id} header={predicate.id}
                    href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(predicate.id)}`}>
                    {predicate.label}
                    </ShortRecord>
            );

            return <div>
                {predicates}
            </div>
        } else {
            return null;
        }
    }

}