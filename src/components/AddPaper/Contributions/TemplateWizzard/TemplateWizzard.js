import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { initializeWithoutContribution } from 'actions/statementBrowser';
import { StyledEmptyData } from 'components/AddPaper/Contributions/styled';
import AddProperty from 'components/StatementBrowser/AddProperty';
import StatementItem from 'components/StatementBrowser/StatementItem';
import ContributionTemplate from './ContributionTemplate';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class TemplateWizzard extends Component {
    constructor(props) {
        super(props);

        if (this.props.initialResourceId) {
            this.props.initializeWithoutContribution({
                resourceId: this.props.initialResourceId,
                label: this.props.initialResourceLabel
            });
        }
    }

    render() {
        let propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.selectedResource
                ? this.props.resources.byId[this.props.selectedResource].propertyIds
                : [];
        let shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.selectedResource
                ? this.props.resources.byId[this.props.selectedResource].shared
                : 1;
        return (
            <div>
                {!this.props.isFetchingStatements ? (
                    propertyIds.length > 0 ? (
                        propertyIds.map((propertyId, index) => {
                            let property = this.props.properties.byId[propertyId];
                            if (!property.isTemplate) {
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
                                        selectedResource={this.props.selectedResource}
                                        contextStyle={'Template'}
                                    />
                                );
                            } else {
                                let valueIds =
                                    Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[propertyId].valueIds : [];
                                return valueIds.map((valueId, index) => {
                                    let value = this.props.values.byId[valueId];
                                    return (
                                        <ContributionTemplate
                                            key={`template-${index}-${valueId}`}
                                            id={valueId}
                                            label={value.label}
                                            propertyId={propertyId}
                                            resourceId={value.resourceId}
                                            enableEdit={this.props.enableEdit}
                                            syncBackend={this.props.syncBackend}
                                            openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                            isEditing={value.isEditing}
                                            isSaving={value.isSaving}
                                        />
                                    );
                                });
                            }
                        })
                    ) : (
                        <StyledEmptyData>
                            No data yet!
                            <br />
                            <small>Start by creating properties or add one of the suggested templates bellow.</small>
                            <br />
                        </StyledEmptyData>
                    )
                ) : (
                    <div>
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}

                <AddProperty contextStyle="Template" syncBackend={false} />
            </div>
        );
    }
}

TemplateWizzard.propTypes = {
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    isFetchingStatements: PropTypes.bool.isRequired,
    selectedResource: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    initializeWithoutContribution: PropTypes.func.isRequired,
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: data => dispatch(initializeWithoutContribution(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemplateWizzard);
