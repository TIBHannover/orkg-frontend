import React, {Component } from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import {submitGetRequest, url} from '../network';

export default class SearchResults extends Component {
    state = {
        resources: null,
        predicates: null,
        error: null,
    };

    constructor(props) {
        super(props);

        this.findResources = this.findResources.bind(this);
        this.findPredicates = this.findPredicates.bind(this);
    }

    componentWillMount() {
        this.findResources();
        this.findPredicates();
    }

    findResources() {
        const that = this;

        submitGetRequest(`${url}resources/?q=${this.props.term}`,
            (responseJson) => {
                that.setState({
                    resources: responseJson,
                    error: null,
                });
            },
            (err) => {
                console.error(err);
                that.setState({
                    resources: null,
                    error: err.message,
                });
            });
    }

    findPredicates() {
        const that = this;

        submitGetRequest(`${url}predicates/?q=${this.props.term}`,
            (responseJson) => {
                that.setState({
                    predicates: responseJson,
                    error: null,
                });
            },
            (err) => {
                console.error(err);
                that.setState({
                    predicates: null,
                    error: err.message,
                });
            });
    }

    render() {
        const resourcesResultsPresent = this.state.error || (this.state.resources);
        const predicatesResultsPresent = this.state.error || (this.state.predicates);
        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }
        let body1 = null;
        let body2 = null;

        if (resourcesResultsPresent) {
            const resources = this.state.resources.map(
                resource => <ShortRecord key={resource.id} header={resource.id} href={'/resource/' + encodeURIComponent(resource.id)}>{resource.label}</ShortRecord>
            );
            if (resources.length > 0)
            {
                body1 =
                <div>
                    <div>
                        <span><u>Resources</u> related to: <b>{this.props.term}</b></span>
                    </div>
                    {resources}
                </div>;
            }
            else
            {
                body1 = <div> <span>No <b>resources</b> found that match your search query</span> </div>;
            }
        }
        if (predicatesResultsPresent) {
            const predicates = this.state.predicates.map(
                predicate => <ShortRecord key={predicate.id} header={predicate.id} href={'/predicate/' + encodeURIComponent(predicate.id)}>{predicate.label}</ShortRecord>
            );
            if (predicates.length > 0)
            {
                body2 = <div> <div> <span><u>Predicates</u> related to: <b>{this.props.term}</b></span> </div> {predicates} </div>;
            }
            else
            {
                body2 = <div> <span>No <b>predicates</b> found that match your search query</span> </div>;
            }
        }
        return [body1, body2];
    }

}