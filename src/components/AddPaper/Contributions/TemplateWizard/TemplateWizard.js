import React, { Component } from 'react';
import { StyledEmptyData } from 'components/AddPaper/Contributions/styled';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import ContributionTemplate from './ContributionTemplate';
import { compose } from 'redux';
import { withCookies, Cookies } from 'react-cookie';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class TemplateWizard extends Component {
    render() {
        const propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].propertyIds
                : [];
        const shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].shared
                : 1;
        return (
            <div className={'contributionData'}>
                {propertyIds.length > 0 ? (
                    propertyIds
                        .filter(propertyId => {
                            const property = this.props.properties.byId[propertyId];
                            return property.existingPredicateId !== process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE;
                        })
                        .map((propertyId, index) => {
                            const property = this.props.properties.byId[propertyId];
                            if (!property.isTemplate) {
                                return (
                                    <StatementItem
                                        id={propertyId}
                                        property={property}
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
                                        resourceId={this.props.initialResourceId}
                                        contextStyle={'Template'}
                                        templateId={property.templateId}
                                        showValueHelp={this.props.cookies && !this.props.cookies.get('showedValueHelp') && index === 0 ? true : false}
                                    />
                                );
                            } else {
                                const valueIds =
                                    Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[propertyId].valueIds : [];
                                return valueIds.map((valueId, index) => {
                                    const value = this.props.values.byId[valueId];
                                    return (
                                        <ContributionTemplate
                                            key={`template-${index}-${valueId}`}
                                            id={valueId}
                                            label={value.label}
                                            propertyId={propertyId}
                                            resourceId={value.resourceId}
                                            selectedResource={this.props.initialResourceId}
                                            enableEdit={this.props.enableEdit}
                                            syncBackend={this.props.syncBackend}
                                            openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                            isEditing={value.isEditing}
                                            isSaving={value.isSaving}
                                            isAnimated={property.isAnimated}
                                        />
                                    );
                                });
                            }
                        })
                ) : (
                    <StyledEmptyData className="text-muted mt-3">
                        No data yet
                        <br />
                        {this.props.templatesFound ? (
                            <span style={{ fontSize: '0.875rem' }}>Start by adding a template or a property</span>
                        ) : (
                            <span style={{ fontSize: '0.875rem' }}>Start by adding a property</span>
                        )}
                        <br />
                    </StyledEmptyData>
                )}

                <AddProperty contextStyle="Template" syncBackend={false} resourceId={this.props.initialResourceId} />
            </div>
        );
    }
}

TemplateWizard.propTypes = {
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    initialResourceId: PropTypes.string,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    templatesFound: PropTypes.bool,
    cookies: PropTypes.instanceOf(Cookies).isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties
    };
};

export default compose(
    connect(mapStateToProps),
    withCookies
)(TemplateWizard);
