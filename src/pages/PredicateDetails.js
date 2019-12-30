import React, { Component } from 'react';
import { predicatesUrl, submitGetRequest } from '../network';
import PropTypes from 'prop-types';
import { Container } from 'reactstrap';

class PredicateDetails extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            title: null
        };
    }

    async componentDidMount() {
        await this.findPredicate();
    }

    findPredicate = async () => {
        try {
            const responseJson = await submitGetRequest(predicatesUrl + encodeURIComponent(this.props.match.params.id));
            this.setState({
                title: responseJson.label
            });
        } catch (err) {
            console.error(err);
            this.setState({
                title: null,
                error: err.message
            });
        }
    };

    render() {
        const resultsPresent = this.state.error || this.state.title;

        if (this.state.error) {
            return (
                <p>
                    <strong>Error:</strong> {this.state.error}{' '}
                </p>
            );
        }

        if (resultsPresent) {
            const titleText = this.state.title;
            const titleJsx = titleText && (
                <div
                    style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}
                    className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom"
                >
                    <h1 className="h2">{titleText}</h1>
                </div>
            );

            return (
                <Container className="box pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">
                    <div className="entityView-main">{titleJsx}</div>
                </Container>
            );
        } else {
            return null;
        }
    }
}

PredicateDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default PredicateDetails;
