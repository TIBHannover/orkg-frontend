import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import TemplateDetailsTooltip from './TemplateDetailsTooltip';
import { createProperty, fetchTemplateIfNeeded } from 'actions/statementBrowser';
import { prefillStatements } from 'actions/addPaper';
import { connect } from 'react-redux';
import { createResource } from 'network';
import Tippy from '@tippy.js/react';
import styled from 'styled-components';
import { guid } from 'utils';
import PropTypes from 'prop-types';

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

    addTemplate = async templateID => {
        this.setState({ isTemplateLoading: true, isTemplateFailedLoading: false });
        this.props.fetchTemplateIfNeeded(templateID).then(async templateDate => {
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
                            range: component.value ? component.value : null,
                            validationRules: component.validationRules
                        });
                    }
                    this.props.prefillStatements({ statements, resourceId: this.props.selectedResource, syncBackend: this.props.syncBackend });
                }
            } else {
                // Add template to the statement browser
                const statements = { properties: [], values: [] };
                const pID = guid();
                const vID = guid();
                const rID = guid();
                let newObject = null;
                statements['properties'].push({
                    propertyId: pID,
                    existingPredicateId: template.predicate.id,
                    label: template.predicate.label,
                    isTemplate: true,
                    isAnimated: false,
                    canDuplicate: true
                });
                if (this.props.syncBackend) {
                    newObject = await createResource(template.label, template.class ? [template.class.id] : []);
                }
                statements['values'].push({
                    valueId: vID,
                    label: template.label,
                    existingResourceId: newObject ? newObject.id : rID,
                    type: 'object',
                    propertyId: pID,
                    classes: template.class ? [template.class.id] : []
                });
                await this.props.prefillStatements({ statements, resourceId: this.props.selectedResource, syncBackend: this.props.syncBackend });
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
                    await this.props.prefillStatements({
                        statements,
                        resourceId: newObject ? newObject.id : rID,
                        syncBackend: this.props.syncBackend
                    });
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
    selectedResource: PropTypes.string, // The resource to prefill with the template
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    fetchTemplateIfNeeded: PropTypes.func.isRequired,
    templates: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired
};

AddTemplateButton.defaultProps = {
    label: '',
    syncBackend: false
};

const mapStateToProps = state => ({
    templates: state.statementBrowser.templates
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
