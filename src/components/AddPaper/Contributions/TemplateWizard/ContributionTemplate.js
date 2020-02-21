import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty';
import TemplateHeader from 'components/AddPaper/Contributions/TemplateWizard/TemplateHeader';
import StatementItem from 'components/StatementBrowser/StatementItem';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

export const AddPropertWrapper = styled(ListGroupItem)`
    border-top: 0 !important;
    padding: 0 !important;
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    & .propertyHolder {
        height: 20px;
        background-color: ${props => props.theme.ultraLightBlue};
    }
`;
const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter,
    &.fadeIn-appear {
        overflow: hidden;
        transition: max-height 1s ease-out; // note that we're transitioning max-height, not height!
        height: auto;
        max-height: 0;
    }
    &.fadeIn-enter-active,
    &.fadeIn-appear-active {
        max-height: 1000px;
    }
`;

class ContributionTemplate extends Component {
    render() {
        const propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.resourceId
                ? this.props.resources.byId[this.props.resourceId].propertyIds
                : [];
        const shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.resourceId
                ? this.props.resources.byId[this.props.resourceId].shared
                : 1;
        return (
            <AnimationContainer classNames="fadeIn" className="mt-3 pb-3" in={true} timeout={{ enter: 700 }} appear>
                <ListGroup>
                    <TemplateHeader
                        syncBackend={this.props.syncBackend}
                        label={this.props.label}
                        id={this.props.id}
                        isEditing={this.props.isEditing}
                        propertyId={this.props.propertyId}
                        resourceId={this.props.selectedResource}
                    />
                    {propertyIds.map((propertyId, index) => {
                        const property = this.props.properties.byId[propertyId];

                        return (
                            <StatementItem
                                id={propertyId}
                                label={property.label}
                                predicateLabel={property.label}
                                key={'statement-' + index}
                                index={index}
                                isExistingProperty={property.isExistingProperty ? true : false}
                                enableEdit={shared <= 1 ? this.props.enableEdit : false}
                                syncBackend={this.props.syncBackend}
                                isLastItem={propertyIds.length === index + 1}
                                openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                isEditing={property.isEditing}
                                isSaving={property.isSaving}
                                inTemplate={true}
                                resourceId={this.props.resourceId}
                                contextStyle={'Template'}
                                templateId={property.templateId}
                            />
                        );
                    })}
                    <AddPropertWrapper>
                        <div className={'row no-gutters'}>
                            <div className={'col-4 propertyHolder'} />
                        </div>
                        <AddProperty
                            syncBackend={this.props.syncBackend}
                            inTemplate={true}
                            contextStyle="Template"
                            resourceId={this.props.resourceId}
                        />
                    </AddPropertWrapper>
                </ListGroup>
            </AnimationContainer>
        );
    }
}

ContributionTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    isEditing: PropTypes.bool.isRequired,
    resourceId: PropTypes.string.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    inTemplate: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool
};

ContributionTemplate.defaultProps = {
    inTemplate: false,
    label: 'Type',
    properties: []
};

const mapStateToProps = state => {
    return {
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
        resources: state.statementBrowser.resources
    };
};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContributionTemplate);
