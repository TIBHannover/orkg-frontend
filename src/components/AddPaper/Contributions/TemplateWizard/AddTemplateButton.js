import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { createProperty } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { guid } from 'utils';
import { getTemplateById } from 'network';
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

class TemplateDetailsTooltip extends Component {
    constructor(props) {
        super(props);

        this.state = {
            template: {},
            isTemplateLoading: false,
            isTemplateFailedLoading: true
        };
    }

    componentDidMount = () => {
        this.loadTemplate();
    };

    loadTemplate = () => {
        this.setState({ isTemplateLoading: true, isTemplateFailedLoading: false });
        getTemplateById(this.props.id).then(template => {
            this.setState({ template, isTemplateLoading: false, isTemplateFailedLoading: false });
        });
    };
    render() {
        return (
            <div>
                {this.state.isTemplateLoading && <>Loading...</>}
                {!this.state.isTemplateLoading && (
                    <>
                        {this.props.source && (
                            <div className={'mb-1'}>
                                <b>Template for:</b>
                                <br />
                                <i>{this.props.source.label}</i>
                            </div>
                        )}
                        {this.state.template.properties && this.state.template.properties.length > 0 && (
                            <div>
                                <b>Properties: </b>
                                <ul>
                                    {this.state.template.properties &&
                                        this.state.template.properties.length > 0 &&
                                        this.state.template.properties.map(property => {
                                            return <li key={`t${property.id}`}>{property.label}</li>;
                                        })}
                                </ul>
                            </div>
                        )}
                        {this.state.template.subTemplates && this.state.template.subTemplates.length > 0 && (
                            <div>
                                <b>Nested Templates: </b>
                                <ul>
                                    {this.state.template.subTemplates.map(subTemplate => {
                                        return <li key={`st${subTemplate.id}`}>{subTemplate.label}</li>;
                                    })}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }
}

TemplateDetailsTooltip.propTypes = {
    id: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired
};

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
        getTemplateById(templateID).then(template => {
            // Check if it's a contribution template
            if (template.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION) {
                // Add properties
                if (template.properties && template.properties.length > 0) {
                    const statements = { properties: [], values: [] };
                    for (const property of template.properties) {
                        statements['properties'].push({
                            existingPredicateId: property.id,
                            label: property.label
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
                    isTemplate: true
                });

                statements['values'].push({
                    valueId: vID,
                    label: template.label,
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
                // Add templates
                if (template.subTemplates && template.subTemplates.length > 0) {
                    const statementsSubTemplates = { properties: [], values: [] };
                    for (const subTemplate of template.subTemplates) {
                        const tpID = guid();
                        //const tvID = guid();
                        statementsSubTemplates['properties'].push({
                            propertyId: tpID,
                            existingPredicateId: subTemplate.predicate.id,
                            label: subTemplate.predicate.label,
                            templateId: subTemplate.id
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
                        className="mr-2 position-relative px-3 rounded-pill border-0"
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
    source: PropTypes.object.isRequired
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
