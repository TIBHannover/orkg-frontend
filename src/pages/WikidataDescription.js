import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import WIKIDATA_LOGO from 'assets/img/sameas/wikidatawiki.png';
import PropTypes from 'prop-types';

class WikidataDescription extends Component {
    constructor(props) {
        super(props);

        this.state = {
            description: '',
            collapsed: true,
            isLoading: false,
            loadingFailed: false
        };
    }

    componentDidMount() {
        this.getDescription();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.externalResource !== this.props.externalResource) {
            this.getDescription();
        }
    }

    getDescription = () => {
        this.setState({ isLoading: true, loadingFailed: false });

        const resource = this.props.externalResource;
        const wikidataID = resource.substr(resource.indexOf('Q'));
        const endpoint = 'https://query.wikidata.org/sparql';
        const query = `
            SELECT
            ?description
            WHERE 
            {
            wd:${wikidataID} schema:description ?description.
            FILTER ( lang(?description) = "en" )
            }
            LIMIT 500
        `;
        const url = endpoint + '?query=' + encodeURIComponent(query) + '&format=json';
        const self = this;

        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (
                    data.results &&
                    data.results.bindings &&
                    data.results.bindings.length > 0 &&
                    data.results.bindings[0].description &&
                    data.results.bindings[0].description.value
                ) {
                    self.setState({
                        description: data.results.bindings[0].description.value,
                        isLoading: false,
                        loadingFailed: false
                    });
                } else {
                    this.setState({ isLoading: false, loadingFailed: true });
                }
            })
            .catch(error => {
                this.setState({ isLoading: false, loadingFailed: true });
            });
    };

    handleReadMore = () => {
        this.setState(prevState => ({
            collapsed: !prevState.collapsed
        }));
    };

    render() {
        const shortDescription = this.state.description.substr(0, 550);
        const showReadMore = this.state.description !== shortDescription;

        return (
            <div className="list-group-item">
                <h2 className="h5 mt-2 float-left">Description from Wikidata</h2>
                <a href={this.props.externalResource} target="_blank" rel="noopener noreferrer">
                    <img alt="Wikidata logo" src={WIKIDATA_LOGO} style={{ height: 40, float: 'right' }} />
                </a>
                <div className="clearfix" />

                <div style={{ fontSize: '90%' }}>
                    {this.state.isLoading && !this.state.loadingFailed && (
                        <div className="text-center">
                            <Icon icon={faSpinner} spin /> Loading description from Wikidata...
                        </div>
                    )}
                    {!this.state.isLoading && this.state.loadingFailed && (
                        <div className="text-warning">Failed loading description from Wikidata.</div>
                    )}
                    {!this.state.isLoading && !this.state.loadingFailed && (
                        <>
                            {this.state.collapsed && this.state.description.length > 550 ? shortDescription + '...' : this.state.description}
                            {showReadMore && (
                                <Button color="link" className="p-0" style={{ fontSize: 'inherit' }} onClick={this.handleReadMore}>
                                    {this.state.collapsed ? 'Read more' : 'Read less'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

WikidataDescription.propTypes = {
    externalResource: PropTypes.string.isRequired
};

export default WikidataDescription;
