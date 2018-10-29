import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';

class SearchForm extends Component {

    constructor(props) {
        super(props);
        
        if (this.props.location.pathname.includes('/search/')) {
            this.state = { value: this.props.location.pathname.substring(this.props.location.pathname.lastIndexOf('/')+1) };
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
            <form className="w-100" onSubmit={this.handleSubmit}>
                <div className="search-form">
                    <input className="form-control form-control-dark" type="text" placeholder={this.props.placeholder}
                        aria-label="Search" value={this.state.value} onChange={this.handleChange}/>
                    <button className="form-control form-control-dark" type="submit">
                        <i className="fa fa-search"/>
                    </button>
                </div>
            </form>
        );
    }
}

export default withRouter(SearchForm);
