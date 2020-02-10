import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { createProperty } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { guid } from 'utils';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button } from 'reactstrap';

const IconWrapper = styled.span`
    background-color: #d1d5e4;
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
    width: 28px;
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.darkblue};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

class AddTemplateButton extends Component {
    addTemplate = () => {
        const statements = { properties: [], values: [] };
        const pID = guid();
        const vID = guid();
        const rID = guid();
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
            const statements = { properties: [], values: [] };
            for (const property of this.props.properties) {
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
            <Button
                onClick={() => {
                    this.addTemplate();
                }}
                size="sm"
                color="light"
                className="mr-2 position-relative px-3 rounded-pill border-0"
            >
                <IconWrapper>
                    <Icon size="sm" icon={faPlus} />
                </IconWrapper>
                <Label>{this.props.label}</Label>
            </Button>
        );
    }
}

AddTemplateButton.propTypes = {
    createProperty: PropTypes.func.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    selectedResource: PropTypes.string,
    predicateId: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    properties: PropTypes.array
};

AddTemplateButton.defaultProps = {
    label: ''
};

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data)),
    prefillStatements: data => dispatch(prefillStatements(data))
});

export default connect(
    null,
    mapDispatchToProps
)(AddTemplateButton);
