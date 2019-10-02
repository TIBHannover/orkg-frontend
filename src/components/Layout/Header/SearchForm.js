import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class SearchForm extends Component {

    constructor(props) {
        super(props);

        if (this.props.location.pathname.includes('/search/')) {
            this.state = { value: this.props.location.pathname.substring(this.props.location.pathname.lastIndexOf('/') + 1) };
        } else {
            this.state = { value: '' };
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    handleSubmit(event) {
        const path = `${process.env.PUBLIC_URL}/search/${encodeURIComponent(this.state.value)}`;
        event.preventDefault();
        //if (this.props.location)
        //console.log(this.props.location.pathname.includes('/search/'));
        //this.props.history.push(path);
        this.setState({ value: '' });
        window.location.href = path;
    }

    render() {
        return (
            <form className="form-inline mt-2 mt-md-0 search-box" onSubmit={this.handleSubmit}>
                <div className="input-group">
                    <input type="text" className="form-control" placeholder={this.props.placeholder} value={this.state.value} 
                        onChange={this.handleChange} aria-label="Search ORKG" aria-describedby="button-main-search"
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
};

export default withRouter(SearchForm);
