import React, {Component} from 'react';
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

    async componentWillMount() {
        await this.findResources();
        await this.findPredicates();
    }

    findResources = async () => {
        try {
            const responseJson = await submitGetRequest(`${url}resources/?q=${this.props.term}`);

            this.setState({
                resources: responseJson,
                error: null,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                resources: null,
                error: err.message,
            });
        }
    };

    findPredicates = async () => {
        try {
            const responseJson = await submitGetRequest(`${url}predicates/?q=${this.props.term}`);

            this.setState({
                predicates: responseJson,
                error: null,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                predicates: null,
                error: err.message,
            });
        }
    };

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
                resource => <ShortRecord key={resource.id} header={resource.label}
                            href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(resource.id)}`}>
                    </ShortRecord>
            );
            if (resources.length > 0) {
                body1 =
                <div>
                    <div>
                        <span><u>Resources</u> related to: <b>{this.props.term}</b></span>
                    </div>
                    {resources}
                </div>;
            } else {
                body1 = <div> <span>No <b>resources</b> found that match your search query</span> </div>;
            }
        }
        if (predicatesResultsPresent) {
            const predicates = this.state.predicates.map(
                predicate => <ShortRecord key={predicate.id} header={predicate.label}
                        href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(predicate.id)}`}>
                        </ShortRecord>
            );
            if (predicates.length > 0) {
                body2 = <div> <div> <span><u>Predicates</u> related to: <b>{this.props.term}</b></span> </div> {predicates} </div>;
            } else {
                body2 = <div> <span>No <b>predicates</b> found that match your search query</span> </div>;
            }
        }
        return [body1, body2];
    }

}
