import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import WIKIPEDIA_LOGO from 'assets/img/sameas/wikipedia.png';
import PropTypes from 'prop-types';

class WikipediaSummary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            summary: '',
            collapsed: true,
            isLoading: false,
            loadingFailed: false
        };
    }

    componentDidMount() {
        this.getSummary();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.externalResource !== this.props.externalResource) {
            this.getSummary();
        }
    }

    getSummary = () => {
        this.setState({ isLoading: true, loadingFailed: false });
        const resource = this.props.externalResource;

        const wikipediaTitle = resource.substr(resource.indexOf('/wiki/')).replace('/wiki/', '');
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikipediaTitle}?origin=*`;
        const self = this;

        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.extract) {
                    self.setState({
                        summary: data.extract,
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
        const shortSummary = this.state.summary.substr(0, 550);
        const showReadMore = this.state.summary !== shortSummary;

        return (
            <div className="list-group-item">
                <h2 className="h5 mt-2 float-left">Summary from Wikipedia</h2>
                <a href={this.props.externalResource} target="_blank" rel="noopener noreferrer">
                    <img alt="DBpedia logo" src={WIKIPEDIA_LOGO} style={{ height: 50, float: 'right' }} />
                </a>
                <div className="clearfix" />

                <div style={{ fontSize: '90%' }}>
                    {this.state.isLoading && !this.state.loadingFailed && (
                        <div className="text-center">
                            <Icon icon={faSpinner} spin /> Loading summary from Wikipedia...
                        </div>
                    )}
                    {!this.state.isLoading && this.state.loadingFailed && <div className="text-primary">Failed loading summary from Wikipedia.</div>}
                    {!this.state.isLoading && !this.state.loadingFailed && (
                        <>
                            {this.state.collapsed && this.state.summary.length > 550 ? shortSummary + '...' : this.state.summary}
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

WikipediaSummary.propTypes = {
    externalResource: PropTypes.string.isRequired
};

export default WikipediaSummary;
