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
    add_template = () => {
        let statements = { properties: [], values: [] };
        let pID = guid();
        let vID = guid();
        statements['properties'].push({
            propertyId: pID,
            existingPredicateId: this.props.predicateId,
            label: this.props.predicateLabel,
            isTemplate: true
        });

        statements['values'].push({
            valueId: vID,
            label: this.props.label,
            type: 'object',
            propertyId: pID
        });

        this.props.prefillStatements({ statements, resourceId: this.props.selectedResource });
        // TODO: Add properties!
        statements = { properties: [], values: [] };
        statements['properties'].push({
            existingPredicateId: 'P21',
            label: 'programming language'
        });
        this.props.prefillStatements({ statements, resourceId: vID });
    };
    render() {
        return (
            <AddTemplateStyle
                onClick={() => {
                    this.add_template();
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
    label: PropTypes.string.isRequired
};

AddTemplateButton.defaultProps = {
    label: ''
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data)),
    prefillStatements: data => dispatch(prefillStatements(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddTemplateButton);
