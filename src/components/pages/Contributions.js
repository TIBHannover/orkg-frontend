import React, {Component} from 'react';
import ShortRecord from "../statements/ShortRecord";
import {submitGetRequest, url} from "../../helpers.js";

export default class Contributions extends Component {
    state = {
        allResources: null,
        allStatements: null,
        allPredicates: [],
        results: null,
        error: null,
    };

    constructor(props) {
        super(props);

        this.findAllResources = this.findAllResources.bind(this);
    }

    componentDidMount() {
        this.findAllResources();
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

    render() {
        const resultsPresent = this.state.error || (/*this.state.results &&*/ this.state.allResources);

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const statements = this.state.allResources.map(
                statement => <ShortRecord key={statement.id} header={statement.id} href={'/contribution/' + encodeURIComponent(statement.id)}>{statement.label}</ShortRecord>
            );

            return <div>
                {statements}
            </div>
        } else {
            return null;
        }
    }

}