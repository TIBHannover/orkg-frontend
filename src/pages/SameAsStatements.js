import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DbpediaAbstract from './DbpediaAbstract';

class SameAsStatements extends Component {
    constructor(props) {
        super(props);

        this.state = {
            externalResources: []
        };

        this.expressionDbPedia = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.selectedResource !== this.props.selectedResource ||
            prevProps.values !== this.props.values ||
            prevProps.properties !== this.props.properties
        ) {
            this.getSameAsResources();
        }
    }

    getSameAsResources = () => {
        const internalSameAsIds =
            this.props.selectedResource && this.props.resources.byId[this.props.selectedResource].propertyIds.length > 0
                ? this.props.resources.byId[this.props.selectedResource].propertyIds.filter(
                      property => this.props.properties.byId[property].existingPredicateId === process.env.REACT_APP_PREDICATES_SAME_AS
                  )
                : [];

        let valueIds = internalSameAsIds.length > 0 ? internalSameAsIds.map(propertyId => this.props.properties.byId[propertyId].valueIds) : [];
        valueIds = valueIds.flat();

        const values = this.props.values ? valueIds.map(valueId => this.props.values.byId[valueId].label) : [];

        this.setState({
            externalResources: values
        });
    };

    render() {
        if (this.state.externalResources.length > 0) {
            return (
                <div>
                    {this.state.externalResources.map((resourceUrl, index) => {
                        if (resourceUrl.match(this.expressionDbPedia)) {
                            return <DbpediaAbstract externalResource={resourceUrl} key={index} />;
                        }
                        return <></>;
                    })}
                </div>
            );
        }
        return null;
    }
}

SameAsStatements.propTypes = {
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    selectedResource: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        level: state.statementBrowser.level,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource
    };
};

export default connect(mapStateToProps)(SameAsStatements);
