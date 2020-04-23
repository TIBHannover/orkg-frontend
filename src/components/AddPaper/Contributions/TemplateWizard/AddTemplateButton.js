import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { createProperty, fetchTemplateIfNeeded } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import TemplateDetailsTooltip from './TemplateDetailsTooltip';
import { guid } from 'utils';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Button } from 'reactstrap';
import Tippy from '@tippy.js/react';

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
            isTemplateFailedLoading: true
        };
    }

    addTemplate = templateID => {
        this.setState({ isTemplateLoading: true, isTemplateFailedLoading: false });
        this.props.fetchTemplateIfNeeded(templateID).then(templateDate => {
            const template = this.props.templates[templateID];
            // Check if it's a contribution template
            if (template.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION) {
                // Add properties
                if (template.components && template.components.length > 0) {
                    const statements = { properties: [], values: [] };
                    for (const component of template.components) {
                        statements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label,
                            validationRules: component.validationRules
                        });
                    }
                    this.props.prefillStatements({ statements, resourceId: this.props.selectedResource });
                }
                // Add templates
                if (template.subTemplates && template.subTemplates.length > 0) {
                    for (const subTemplate of template.subTemplates) {
                        this.addTemplate(subTemplate.id);
                    }
                }
            } else {
                // Add template to the statement browser
                const statements = { properties: [], values: [] };
                const pID = guid();
                const vID = guid();
                const rID = guid();
                statements['properties'].push({
                    propertyId: pID,
                    existingPredicateId: template.predicate.id,
                    label: template.predicate.label,
                    isTemplate: true,
                    isAnimated: false
                });

                statements['values'].push({
                    valueId: vID,
                    label: template.label,
                    existingResourceId: rID,
                    type: 'object',
                    propertyId: pID,
                    classes: template.class ? [template.class] : [],
                    templateId: template.id
                });
                this.props.prefillStatements({ statements, resourceId: this.props.selectedResource });
                // Add properties
                if (template.components && template.components.length > 0) {
                    const statements = { properties: [], values: [] };
                    for (const component of template.components) {
                        statements['properties'].push({
                            existingPredicateId: component.property.id,
                            label: component.property.label,
                            validationRules: component.validationRules
                        });
                    }
                    this.props.prefillStatements({ statements, resourceId: rID });
                }
                // Tag resource with used template
                const tagResourceStatements = { properties: [], values: [] };
                const ipID = guid();
                tagResourceStatements['properties'].push({
                    propertyId: ipID,
                    existingPredicateId: process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE,
                    label: 'Instance Of Template'
                });
                const ivID = guid();
                tagResourceStatements['values'].push({
                    valueId: ivID,
                    label: template.label,
                    existingResourceId: templateID,
                    type: 'object',
                    propertyId: ipID,
                    isExistingValue: true
                });
                this.props.prefillStatements({ statements: tagResourceStatements, resourceId: rID });

                // Add templates
                if (template.subTemplates && template.subTemplates.length > 0) {
                    const statementsSubTemplates = { properties: [], values: [] };
                    for (const subTemplate of template.subTemplates) {
                        const tpID = guid();
                        //const tvID = guid();
                        statementsSubTemplates['properties'].push({
                            propertyId: tpID,
                            existingPredicateId: subTemplate.predicate.id,
                            label: subTemplate.predicate.label
                        });
                    }
                    this.props.prefillStatements({ statements: statementsSubTemplates, resourceId: rID });
                }
            }
            this.setState({ isTemplateLoading: false, isTemplateFailedLoading: false });
        });
    };

    render() {
        return (
            <Tippy content={<TemplateDetailsTooltip id={this.props.id} source={this.props.source} />}>
                <span>
                    <Button
                        onClick={() => {
                            this.addTemplate(this.props.id);
                        }}
                        size="sm"
                        color="light"
                        className="mr-2 mb-2 position-relative px-3 rounded-pill border-0"
                    >
                        <IconWrapper>
                            {!this.state.isTemplateLoading && <Icon size="sm" icon={faPlus} />}
                            {this.state.isTemplateLoading && <Icon icon={faSpinner} spin />}
                        </IconWrapper>
                        <Label>{this.props.label}</Label>
                    </Button>
                </span>
            </Tippy>
        );
    }
}

AddTemplateButton.propTypes = {
    createProperty: PropTypes.func.isRequired,
    prefillStatements: PropTypes.func.isRequired,
    selectedResource: PropTypes.string,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    fetchTemplateIfNeeded: PropTypes.func.isRequired,
    templates: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
};

AddTemplateButton.defaultProps = {
    label: ''
};

const mapStateToProps = state => ({
    currentStep: state.addPaper.currentStep,
    addPaper: state.addPaper,
    templates: state.statementBrowser.templates,
    classes: state.statementBrowser.classes
});

const mapDispatchToProps = dispatch => ({
    createProperty: data => dispatch(createProperty(data)),
    prefillStatements: data => dispatch(prefillStatements(data)),
    fetchTemplateIfNeeded: data => dispatch(fetchTemplateIfNeeded(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AddTemplateButton);
