import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import ROUTES from '../../../constants/routes.js';
import { reverse } from 'named-urls';

class SearchForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            redirect: false,
            value: ''
        };
    }

    handleChange = event => {
        this.setState({ value: event.target.value });
    };

    handleSubmit = e => {
        this.setState({
            redirect: true
        });

        e.preventDefault();
    };

    render() {
        if (this.state.redirect) {
            this.setState({
                redirect: false,
                value: ''
            });

            return <Redirect to={reverse(ROUTES.SEARCH, { searchTerm: this.state.value })} />;
        }

        return (
            <form className="form-inline mt-2 mt-md-0 mr-3 search-box" onSubmit={this.handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder={this.props.placeholder}
                        value={this.state.value}
                        onChange={this.handleChange}
                        aria-label="Search ORKG"
                        aria-describedby="button-main-search"
                    />

                    <div className="input-group-append">
                        <button id="button-main-search" className="btn btn-outline-secondary pl-2 pr-2 search-icon" type="submit">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}

SearchForm.propTypes = {
    location: PropTypes.object.isRequired,
    placeholder: PropTypes.string.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            searchTerm: PropTypes.string
        }).isRequired
    }).isRequired
};

export default withRouter(SearchForm);
