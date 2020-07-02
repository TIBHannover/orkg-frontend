import React from 'react';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { getSuggestedProperties, createProperty } from 'actions/statementBrowser';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

function PropertySuggestions(props) {
    return (
        <>
            <p className="text-muted mt-4">Suggested properties</p>
            <ListGroup>
                {props.suggestedProperties.map((c, index) => (
                    <ListGroupItem key={`suggested-property-${index}`}>
                        <StatementOptionButton
                            className="mr-2"
                            title="Add property"
                            icon={faPlus}
                            action={() => {
                                props.createProperty({
                                    resourceId: props.selectedResource,
                                    existingPredicateId: c.property.id,
                                    label: c.property.label,
                                    isTemplate: false,
                                    createAndSelect: true
                                });
                            }}
                        />
                        {c.property.label}
                        <Badge pill className="ml-2">
                            {c.value.label}
                        </Badge>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </>
    );
}

PropertySuggestions.propTypes = {
    createProperty: PropTypes.func.isRequired,
    suggestedProperties: PropTypes.array.isRequired,
    selectedResource: PropTypes.string.isRequired
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
        suggestedProperties: getSuggestedProperties(state, state.statementBrowser.selectedResource)
    };
};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PropertySuggestions);
