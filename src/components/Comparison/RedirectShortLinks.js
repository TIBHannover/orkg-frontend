import React, { Component } from 'react';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';
import { getLongLink } from '../../network';

class RedirectShortLinks extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            longURL: null
        };
    }

    componentDidMount = () => {
        getLongLink(this.props.match.params.shortCode).then(data => {
            window.location.href = data.long_url;
            return null;
        });
    };

    render() {
        return (
            <>
                {this.state.loading && (
                    <Container className="p-0 d-flex align-items-center">
                        <h1 className="h5 mt-4 mb-4 ">Redirection....</h1>
                    </Container>
                )}
            </>
        );
    }
}

RedirectShortLinks.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            shortCode: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default RedirectShortLinks;
