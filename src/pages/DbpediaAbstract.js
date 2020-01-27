import React, { Component } from 'react';
import { Button } from 'reactstrap';
import DBPEDIA_LOGO from 'assets/img/sameas/dbpedia.png';
import PropTypes from 'prop-types';

class DbpediaAbstract extends Component {
    constructor(props) {
        super(props);

        this.state = {
            abstract: '',
            collapsed: true
        };

        this.getAbstract();
    }

    getAbstract = async () => {
        const resource = this.props.externalResource;
        const endpoint = 'http://dbpedia.org/sparql';
        const query = `
            SELECT
                ?abstract
            WHERE 
                {
                    <${resource}> <http://dbpedia.org/ontology/abstract> ?abstract .
                    FILTER (lang(?abstract) = 'en')
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
                    data.results.bindings[0].abstract &&
                    data.results.bindings[0].abstract.value
                ) {
                    self.setState({
                        abstract: data.results.bindings[0].abstract.value
                    });
                }
            });
    };

    handleReadMore = () => {
        this.setState(prevState => ({
            collapsed: !prevState.collapsed
        }));
    };

    render() {
        const shortAbstract = this.state.abstract.substr(0, 550);
        const showReadMore = this.state.abstract !== shortAbstract;

        return (
            <div className="mt-5 mb-2 list-group-item">
                <h2 className="h5 mt-2 float-left">Abstract from DBpedia</h2>
                <a href={this.props.externalResource} target="_blank" rel="noopener noreferrer">
                    <img alt="DBpedia logo" src={DBPEDIA_LOGO} style={{ height: 40, float: 'right' }} />
                </a>
                <div className="clearfix" />

                <div style={{ fontSize: '90%' }}>
                    {this.state.collapsed ? shortAbstract + '...' : this.state.abstract}
                    {showReadMore && (
                        <Button color="link" className="p-0" style={{ fontSize: 'inherit' }} onClick={this.handleReadMore}>
                            {this.state.collapsed ? 'Read more' : 'Read less'}
                        </Button>
                    )}
                </div>
            </div>
        );
    }
}

DbpediaAbstract.propTypes = {
    externalResource: PropTypes.string.isRequired
};

export default DbpediaAbstract;
