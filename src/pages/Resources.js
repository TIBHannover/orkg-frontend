import React, {Component} from 'react';
import ShortRecord from "../components/statements/ShortRecord";
import {submitGetRequest, url} from "../helpers.js";

export default class Resources extends Component {
    state = {
        allResources: null,
        results: null,
        error: null,
    };

    constructor(props) {
        super(props);

        this.findAllResources = this.findAllResources.bind(this);
    }

    componentWillMount() {
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
            const resources = this.state.allResources.map(
                resource => <ShortRecord key={resource.id} header={resource.id} href={'/resource/' + encodeURIComponent(resource.id)}>{resource.label}</ShortRecord>
            );

            return <div>
                {resources}
            </div>
        } else {
            return null;
        }
    }

}