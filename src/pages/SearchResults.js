import React, { Component } from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import PropTypes from 'prop-types';
import { submitGetRequest, url } from '../network';
import { Container } from 'reactstrap';

class SearchResults extends Component {


    constructor(props) {
        super(props);

        this.findResources = this.findResources.bind(this);
        this.findPredicates = this.findPredicates.bind(this);
    }

    state = {
        resources: null,
        predicates: null,
        error: null,
    }; 

    async componentWillMount() {
        await this.findResources();
        await this.findPredicates();
    }

    componentDidMount = () => {
        document.title = `Search result : ${this.props.match.params.searchTerm} - ORKG`
    }

    findResources = async () => {
        try {
            const responseJson = await submitGetRequest(`${url}resources/?q=${this.props.match.params.searchTerm}`);

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
            const responseJson = await submitGetRequest(`${url}predicates/?q=${this.props.match.params.searchTerm}`);

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
                resource => (
                    <ShortRecord key={resource.id} header={resource.label}
                        href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(resource.id)}`}
                    />)
            );
            if (resources.length > 0) {
                body1 = (
                    <div>
                        <div>
                            <span><u>Resources</u> related to: <b>{this.props.match.params.searchTerm}</b></span>
                        </div>
                        {resources}
                    </div>
                );
            } else {
                body1 = <div> <span>No <b>resources</b> found that match your search query</span> </div>;
            }
        }
        if (predicatesResultsPresent) {
            const predicates = this.state.predicates.map(
                predicate => (
                    <ShortRecord key={predicate.id} header={predicate.label}
                        href={`${process.env.PUBLIC_URL}/predicate/${encodeURIComponent(predicate.id)}`}
                    />
                )
            );
            if (predicates.length > 0) {
                body2 = <div> <div> <span><u>Predicates</u> related to: <b>{this.props.match.params.searchTerm}</b></span> </div> {predicates} </div>;
            } else {
                body2 = <div> <span>No <b>predicates</b> found that match your search query</span> </div>;
            }
        }
        return (
            <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">
                {body1} {body2}
            </Container>
        );
    }

}


SearchResults.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            searchTerm: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
};

export default SearchResults;