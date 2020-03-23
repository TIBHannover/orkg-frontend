import React, { Component } from 'react';
import { getResource, predicatesUrl, submitGetRequest, updateStatement, createPredicate, deleteStatementById } from 'network';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import StatementItemSB from './StatementItemSB';
import StatementItemTemplate from './StatementItemTemplate';
import { guid } from 'utils';

export default class StatementItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            predicateLabel: null,
            isCollapsed: true
        };
    }

    componentDidMount() {
        this.getPredicateLabel();
    }

    componentDidUpdate(prevProps) {
        if (this.props.predicateLabel !== prevProps.predicateLabel) {
            this.getPredicateLabel();
        }
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    toggleDeleteStatement = async e => {
        e.stopPropagation();

        const property = this.props.properties.byId[this.props.id];
        let title = '';
        let message = '';
        if (property.valueIds.length === 0) {
            title = (
                <>
                    Delete the <i>{property.label}</i> property?
                </>
            );
            message = 'Are you sure you want to delete this property?';
        } else {
            title = (
                <>
                    Delete the <i>{property.label}</i> property and all related values?
                </>
            );
            message = `Also, ${property.valueIds.length} related ${property.valueIds.length === 1 ? 'value' : 'values'} will be deleted.`;
        }
        const result = await Confirm({
            title: title,
            message: message,
            cancelColor: 'light'
        });

        if (result) {
            if (this.props.syncBackend) {
                // Delete All related statements
                if (property.valueIds.length > 0) {
                    for (const valueId of property.valueIds) {
                        const value = this.props.values.byId[valueId];
                        deleteStatementById(value.statementId);
                    }
                    toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
                }
            }
            this.props.deleteProperty({
                id: this.props.id,
                resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource
            });
        }
    };

    handleDeleteStatement = async () => {
        const property = this.props.properties.byId[this.props.id];
        if (this.props.syncBackend) {
            // Delete All related statements
            if (property.valueIds.length > 0) {
                for (const valueId of property.valueIds) {
                    const value = this.props.values.byId[valueId];
                    deleteStatementById(value.statementId);
                }
                toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
            }
        }
        this.props.deleteProperty({
            id: this.props.id,
            resourceId: this.props.resourceId ? this.props.resourceId : this.props.selectedResource
        });
    };

    handleChange = async (selectedOption, a) => {
        const property = this.props.properties.byId[this.props.id];
        // Check if the user changed the property
        if (this.props.predicateLabel !== selectedOption.label || property.existingPredicateId !== selectedOption.id) {
            this.props.isSavingProperty({ id: this.props.id }); // Show the saving message instead of the property label
            if (a.action === 'select-option') {
                this.changePredicate({ ...selectedOption, isExistingProperty: true });
            } else if (a.action === 'create-option') {
                let newPredicate = null;
                if (this.props.syncBackend) {
                    newPredicate = await createPredicate(selectedOption.label);
                    newPredicate['isExistingProperty'] = true;
                } else {
                    newPredicate = { id: guid(), label: selectedOption.label, isExistingProperty: false };
                }
                this.changePredicate(newPredicate);
            }
        }
    };

    changePredicate = async newProperty => {
        if (this.props.syncBackend) {
            const predicate = this.props.properties.byId[this.props.id];
            const existingPredicateId = predicate ? predicate.existingPredicateId : false;
            if (existingPredicateId) {
                const values = predicate.valueIds;
                for (const value of values) {
                    await updateStatement(this.props.values.byId[value].statementId, { predicate_id: newProperty.id });
                }
                this.props.changeProperty({ propertyId: this.props.id, newProperty: newProperty });
                toast.success('Property updated successfully');
            }
        } else {
            this.props.changeProperty({ propertyId: this.props.id, newProperty: newProperty });
        }
        this.props.doneSavingProperty({ id: this.props.id });
    };

    getPredicateLabel = () => {
        if (this.props.predicateLabel.match(new RegExp('^R[0-9]*$'))) {
            getResource(this.props.predicateLabel)
                .catch(e => {
                    console.log(e);
                    this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) });
                })
                .then(r => {
                    this.setState({ predicateLabel: `${r.label.charAt(0).toUpperCase() + r.label.slice(1)} (${this.props.predicateLabel})` });
                });
        } else {
            this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) });
        }
    };

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteContributionModal: !prevState.deleteContributionModal
        }));
    };

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(predicatesUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }

                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    };

    loadOptions = async value => {
        try {
            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(value) + queryParams);
            responseJson = await this.IdMatch(value, responseJson);

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            const options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    render() {
        if (this.props.contextStyle === 'StatementBrowser') {
            return (
                <StatementItemSB
                    togglePropertyCollapse={this.props.togglePropertyCollapse}
                    property={this.props.property}
                    id={this.props.id}
                    selectedProperty={this.props.selectedProperty}
                    isLastItem={this.props.isLastItem}
                    enableEdit={this.props.enableEdit}
                    loadOptions={this.loadOptions}
                    predicateLabel={this.props.predicateLabel}
                    values={this.props.values}
                    syncBackend={this.props.syncBackend}
                    handleChange={this.handleChange}
                    toggleEditPropertyLabel={this.props.toggleEditPropertyLabel}
                    showValueHelp={this.props.showValueHelp}
                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                />
            );
        } else {
            return (
                <StatementItemTemplate
                    togglePropertyCollapse={this.props.togglePropertyCollapse}
                    property={this.props.property}
                    id={this.props.id}
                    selectedProperty={this.props.selectedProperty}
                    isLastItem={this.props.isLastItem}
                    enableEdit={this.props.enableEdit}
                    loadOptions={this.loadOptions}
                    predicateLabel={this.props.predicateLabel}
                    values={this.props.values}
                    syncBackend={this.props.syncBackend}
                    handleChange={this.handleChange}
                    toggleEditPropertyLabel={this.props.toggleEditPropertyLabel}
                    inTemplate={this.props.inTemplate}
                    showValueHelp={this.props.showValueHelp}
                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                    handleDeleteStatement={this.handleDeleteStatement}
                />
            );
        }
    }
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    property: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    isExistingProperty: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    togglePropertyCollapse: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    updatePropertyLabel: PropTypes.func.isRequired,
    changeProperty: PropTypes.func.isRequired,
    isSavingProperty: PropTypes.func.isRequired,
    doneSavingProperty: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    createProperty: PropTypes.func.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    contextStyle: PropTypes.string.isRequired,
    resourceId: PropTypes.string,
    inTemplate: PropTypes.bool,
    templateId: PropTypes.string,
    showValueHelp: PropTypes.bool
};

StatementItem.defaultProps = {
    resourceId: null,
    contextStyle: 'StatementBrowser',
    showValueHelp: false
};
