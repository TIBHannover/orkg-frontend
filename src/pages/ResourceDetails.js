import React, {Component} from 'react';
import StatementGroupCard from '../components/statements/existing/StatementGroupCard';
import {getPredicate, getResource, groupBy, submitGetRequest, resourcesUrl, statementsUrl} from '../helpers';
import './ResourceDetails.css';
import NewStatementsSection from '../components/statements/new/NewStatementsSection';

export default class ResourceDetails extends Component {

    state = {
        allStatements: null,
        results: null,
        error: null,
        title: null,
        predicateMap: {},
        objectMap: {},
    };

    initialState = this.state;

    constructor(props) {
        super(props);

        this.updateMissingPredicateLabels = this.updateMissingPredicateLabels.bind(this);
        this.reset = this.reset.bind(this);
        this.getStatementText = this.getStatementText.bind(this);
        this.setStatementText = this.setStatementText.bind(this);
    }

    componentWillMount() {
        this.findResource();
        this.findAllStatements();
    }

    findResource = () => {
        const that = this;

        submitGetRequest(resourcesUrl + this.props.id + '/',
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

    findAllStatements = () => {
        const that = this;

        submitGetRequest(statementsUrl,
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
    };

    updateMissingPredicateLabels() {
        // TODO: implement more efficient way to fetch all predicates instead of querying them one by one.
        const that = this;
        this.state.allStatements.forEach((statement) => {
            if (!that.state.predicateMap[statement.predicate]) {
                getPredicate(statement.predicate,
                    (responseJson) => {
                        const predicateMap = that.state.predicateMap;
                        predicateMap[responseJson.id] = responseJson.label;
                        that.forceUpdate();
                    },
                    (err) => {
                        console.error(err);
                    });
            }
        });
    }

    updateMissingObjectLabels() {
        // TODO: implement more efficient way to fetch all objects instead of querying them one by one.
        const that = this;
        this.state.allStatements.forEach((statement) => {
            if (!that.state.objectMap[statement.object.id]) {
                getResource(statement.object.id,
                    (responseJson) => {
                        that.setStatementText(responseJson.id)(responseJson.label);
                        that.forceUpdate();
                    },
                    (err) => {
                        console.error(err);
                    });
            }
        });
    }

    reset(newRecordLabel) {
        this.findAllStatements();
        this.setState(this.initialState);
    }

    getStatementText(statementId) {
        const that = this;
        return () => {
            return that.state.objectMap[statementId] || statementId;
        }
    }

    setStatementText(statementId) {
        const that = this;
        return (text) => {
            that.state.objectMap[statementId] = text;
        }
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
            this.updateMissingPredicateLabels();
            this.updateMissingObjectLabels();

            const titleText = this.state.title;
            const titleJsx = titleText && <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pb-2 mb-3 border-bottom">
                <h1 className="h2">{titleText}</h1>
            </div>;

            const abstractText = this.state.allStatements.find(statement => statement.subject === id
                    && statement.predicate === abstractId);
            const abstractJsx = abstractText && <div>{abstractText.object.id}</div>;

            const groupingProperty = "predicate";
            const statements = this.state.allStatements.filter(statement => statement.subject === id
                    && statement.predicate !== labelId && statement.predicate !== abstractId);
            const groupedStatements = groupBy(statements, groupingProperty);
            const statementGroupJsxs = groupedStatements.map(
                statementGroup => {
                    if (statementGroup.length > 0) {
                        const propertyId = statementGroup[0][groupingProperty];
                        return <StatementGroupCard href="#" key={propertyId}
                                label={this.state.predicateMap[propertyId] || propertyId}
                                onUpdate={this.reset} statementGroup={statementGroup}
                                getStatementText={this.getStatementText}
                                setStatementText={this.setStatementText}/>
                    } else {
                        return null;
                    }
                }
            );
            const newStatementsSectionJsx = <NewStatementsSection/>;

            return <div className="entityView-main">
                {[titleJsx, abstractJsx].concat(statementGroupJsxs).concat([newStatementsSectionJsx])}
            </div>
        } else {
            return null;
        }
    }
}