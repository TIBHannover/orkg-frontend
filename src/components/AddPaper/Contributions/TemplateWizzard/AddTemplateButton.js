import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AddTemplateStyle } from './../styled';
import PropTypes from 'prop-types';
import { createProperty } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { guid } from 'utils';
import { connect } from 'react-redux';

class AddTemplateButton extends Component {
    addTemplate = () => {
        let statements = { properties: [], values: [] };
        let pID = guid();
        let vID = guid();
        let rID = guid();
        statements['properties'].push({
            propertyId: pID,
            existingPredicateId: this.props.predicateId,
            label: this.props.predicateLabel,
            isTemplate: true
        });

        statements['values'].push({
            valueId: vID,
            label: this.props.label,
            existingResourceId: rID,
            type: 'object',
            propertyId: pID
        });
        this.props.prefillStatements({ statements, resourceId: this.props.selectedResource });
        // Add properties
        if (this.props.properties && this.props.properties.length > 0) {
            let statements = { properties: [], values: [] };
            for (let property of this.props.properties) {
                statements['properties'].push({
                    existingPredicateId: property.id,
                    label: property.label
                });
            }
            this.props.prefillStatements({ statements, resourceId: rID });
        }
    };
    render() {
        return (
            <AddTemplateStyle
                onClick={() => {
                    this.addTemplate();
                }}
            >
                <span className="iconWrapper">
                    <Icon size="xs" icon={faPlus} />
                </span>
                <span className="labelWrapper">{this.props.label}</span>
            </AddTemplateStyle>
        );
    }
}

AddTemplateButton.propTypes = {
    createProperty: PropTypes.func.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    predicateId: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    properties: PropTypes.array
};

AddTemplateButton.defaultProps = {
    label: ''
};

const mapStateToProps = state => {};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data)),
    prefillStatements: data => dispatch(prefillStatements(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddTemplateButton);
