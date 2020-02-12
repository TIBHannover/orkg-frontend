import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { createProperty } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { guid } from 'utils';
import { getStatementsBySubject } from 'network';
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
    constructor(props) {
        super(props);

        this.state = {
            isTemplateLoading: false,
            isTemplateFailesLoading: true
        };
    }

    addTemplate = () => {
        this.setState({ isTemplateLoading: true, isTemplateFailesLoading: false });
        this.getTemplateById(this.props.id).then(template => {
            // Add template to the statement browser
            const statements = { properties: [], values: [] };
            const pID = guid();
            const vID = guid();
            const rID = guid();
            statements['properties'].push({
                propertyId: pID,
                existingPredicateId: template.predicate.id,
                label: template.predicate.label,
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
            if (template.properties && template.properties.length > 0) {
                const statements = { properties: [], values: [] };
                for (const property of template.properties) {
                    statements['properties'].push({
                        existingPredicateId: property.id,
                        label: property.label
                    });
                }
                this.props.prefillStatements({ statements, resourceId: rID });
            }

            this.setState({ isTemplateLoading: false, isTemplateFailesLoading: false });
        });
    };

    /**
     * Load template by ID
     *
     * @param {String} templateId Template Id
     */
    getTemplateById = templateId => {
        return getStatementsBySubject({ id: templateId }).then(templateStatements => {
            const templatePredicate = templateStatements
                .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_OF_PREDICATE)
                .map(statement => ({
                    id: statement.object.id,
                    label: statement.object.label
                }));
            return {
                id: templateId,
                predicate: templatePredicate[0],
                properties: templateStatements
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_TEMPLATE_PROPERTY)
                    .map(statement => ({
                        id: statement.object.id,
                        label: statement.object.label
                    }))
            };
        });
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
                    {!this.state.isTemplateLoading && <Icon size="sm" icon={faPlus} />}
                    {this.state.isTemplateLoading && <Icon icon={faSpinner} spin />}
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
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
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
