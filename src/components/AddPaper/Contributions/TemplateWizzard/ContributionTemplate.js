import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty';
import TemplateHeader from 'components/AddPaper/Contributions/TemplateWizzard/TemplateHeader';
import StatementItem from 'components/StatementBrowser/StatementItem';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const TemplateStyle = styled(ListGroup)`
    .headerOptions {
        display: none;
    }
    &:hover .headerOptions {
        display: inline-block;
        span {
            background-color: ${props => props.theme.buttonDark};
            color: ${props => props.theme.ultraLightBlue};
        }
    }
`;

export const AddPropertWrapper = styled(ListGroupItem)`
    border-top: 0 !important;
    padding: 0 !important;
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    & .propertyHolder {
        height: 30px;
        background-color: ${props => props.theme.ultraLightBlue};
    }
`;

class ContributionTemplate extends Component {
    render() {
        let propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.resourceId
                ? this.props.resources.byId[this.props.resourceId].propertyIds
                : [];
        let shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.resourceId
                ? this.props.resources.byId[this.props.resourceId].shared
                : 1;
        return (
            <TemplateStyle className={'mt-3 mb-5'}>
                <TemplateHeader
                    syncBackend={this.props.syncBackend}
                    label={this.props.label}
                    id={this.props.id}
                    isEditing={this.props.isEditing}
                    propertyId={this.props.propertyId}
                />
                {propertyIds.map((propertyId, index) => {
                    let property = this.props.properties.byId[propertyId];

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
                        />
                    );
                })}

                <AddPropertWrapper>
                    <div className={'row no-gutters'}>
                        <div className={'col-4 propertyHolder'} />
                    </div>
                    <AddProperty syncBackend={this.props.syncBackend} inTemplate={true} contextStyle="Template" resourceId={this.props.resourceId} />
                </AddPropertWrapper>
            </TemplateStyle>
        );
    }
}

ContributionTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
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
