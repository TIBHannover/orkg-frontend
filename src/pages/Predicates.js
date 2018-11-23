import React, {Component} from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import {submitGetRequest, url} from '../network';

export default class Predicates extends Component {
    state = {
        allPredicates: null,
        results: null,
        error: null,
    };

    async componentWillMount() {
        await this.findAllPredicates();
    }

    findAllPredicates = async () => {
        try {
            const responseJson = await submitGetRequest(url + 'predicates/');
            this.setState({
                allPredicates: responseJson,
                error: null,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                allPredicates: null,
                error: err.message,
            });
        }
    };

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
