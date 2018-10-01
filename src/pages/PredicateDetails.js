import React, {Component} from 'react';
import StatementGroupCard from '../components/statements/existing/StatementGroupCard';
import {getPredicate, getResource, groupBy, submitGetRequest, predicatesUrl} from '../helpers';
import './ResourceDetails.css';
import NewStatementsSection from '../components/statements/new/NewStatementsSection';

export default class PredicateDetails extends Component {

    state = {
        error: null,
        title: null,
    };

    initialState = this.state;

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.findPredicate();
    }

    findPredicate = () => {
        const that = this;

        submitGetRequest(predicatesUrl + this.props.id + '/',
                (responseJson) => {
                    that.setState({
                        title: responseJson.label,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        title: null,
                        error: err.message,
                    });
                });
    };

    render() {
        const id = this.props.id;
        const resultsPresent = this.state.error || (this.state.title);

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const titleText = this.state.title;
            const titleJsx = titleText && <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <h1 className="h2">{titleText}</h1>
            </div>;

            return <div className="entityView-main">
                {titleJsx}
            </div>
        } else {
            return null;
        }
    }
}