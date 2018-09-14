import React, {Component} from 'react';
import StatementsCard from "../statements/StatementsCard";
import Statement from "../statements/Statement";
import {submitGetRequest, url} from "../../helpers";
import ShortRecord from "../statements/ShortRecord";

export default class ContributionDetails extends Component {

    state = {
        allStatements: null,
        results: null,
        error: null,
    };

    constructor(props) {
        super(props);

        this.findAllStatements = this.findAllStatements.bind(this);
    }

    componentWillMount() {
        this.findAllStatements();
    }

    findAllStatements() {
        const that = this;

        submitGetRequest(url + 'statements/',
            (responseJson) => {
                that.setState({
                    allStatements: responseJson,
                    error: null,
                });
            },
            (err) => {
                console.error(err);
                that.setState({
                    allStatements: null,
                    error: err.message,
                });
            });
    }

    render() {
        const id = this.props.id;
        const resultsPresent = this.state.error || (this.state.allStatements);
        const labelId = "http://www.w3.org/2000/01/rdf-schema#label";
        const abstractId = "http://orkg.tib.eu/ontology/abstract";

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const statements = this.state.allStatements.filter(statement => statement.subject === id &&
                    statement.predicate !== labelId && statement.predicate !== abstractId).map(
                        statement => (
                            <StatementsCard href="#" label={statement.predicate}>
                                <Statement><a href="#">{statement.object.id}</a></Statement>
                            </StatementsCard>
                        )
                    );
            const titleText = this.state.allStatements.find(statement => statement.subject === id
                && statement.predicate === labelId);
            const title = titleText ? <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <h1 className="h2">{titleText.object.id}</h1>
            </div> : null;

            const abstractText = this.state.allStatements.find(statement => statement.subject === id
                && statement.predicate === abstractId);
            const abstract = abstractText ? <div>
                {abstractText.object.id}
            </div> : null;

            return <div>
                {[title, abstract].concat(statements)}
            </div>
        } else {
            return null;
        }
    }

}