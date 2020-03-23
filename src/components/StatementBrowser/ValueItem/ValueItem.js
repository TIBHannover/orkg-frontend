import React, { Component } from 'react';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import {
    deleteStatementById,
    updateLiteral,
    submitGetRequest,
    resourcesUrl,
    updateStatement,
    createResource as createResourceAPICall,
    updateResource
} from 'network';
import { toast } from 'react-toastify';
import { guid } from 'utils';
import ValueItemSB from './ValueItemSB';
import ValueItemTemplate from './ValueItemTemplate';
import PropTypes from 'prop-types';

export default class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            modalDataset: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            disableHover: false
        };
    }

    commitChangeLiteral = async draftLabel => {
        // Check if the user changed the label
        if (draftLabel !== this.props.label) {
            this.props.updateValueLabel({
                label: draftLabel,
                valueId: this.props.id
            });
            if (this.props.syncBackend) {
                this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
                if (this.props.resourceId) {
                    await updateLiteral(this.props.resourceId, draftLabel);
                    toast.success('Literal label updated successfully');
                }
                this.props.doneSavingValue({ id: this.props.id });
            }
        }
    };

    commitChangeLabel = async draftLabel => {
        // Check if the user changed the label
        if (draftLabel !== this.props.label) {
            this.props.updateValueLabel({
                label: draftLabel,
                valueId: this.props.id
            });
            if (this.props.syncBackend) {
                this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
                if (this.props.resourceId) {
                    await updateResource(this.props.resourceId, draftLabel);
                    toast.success('Resource label updated successfully');
                }
                this.props.doneSavingValue({ id: this.props.id });
            }
        }
    };

    handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (this.props.label !== selectedOption.label || this.props.resourceId !== selectedOption.id) {
            this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                this.changeValueinStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (this.props.syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = { id: guid(), isExistingValue: false, label: selectedOption.label, type: 'object', classes: [], shared: 1 };
                }
                await this.changeValueinStatementBrowser(newResource);
            }
            this.props.doneSavingValue({ id: this.props.id });
        }
    };

    changeValueinStatementBrowser = async newResource => {
        if (this.props.syncBackend && this.props.statementId) {
            await updateStatement(this.props.statementId, { object_id: newResource.id });
            this.props.changeValue({
                valueId: this.props.id,
                ...{
                    classes: newResource.classes,
                    label: newResource.label,
                    resourceId: newResource.id,
                    existingResourceId: newResource.id,
                    isExistingValue: newResource.isExistingValue,
                    existingStatement: true,
                    statementId: this.props.statementId,
                    shared: newResource.shared
                }
            });
            toast.success('Value updated successfully');
        } else {
            this.props.changeValue({
                valueId: this.props.id,
                ...{
                    classes: newResource.classes,
                    label: newResource.label,
                    resourceId: newResource.id,
                    existingResourceId: newResource.isExistingValue ? newResource.id : null,
                    isExistingValue: newResource.isExistingValue,
                    existingStatement: false,
                    statementId: null,
                    shared: newResource.shared
                }
            });
        }
    };

    handleDeleteValue = async () => {
        if (this.props.syncBackend) {
            await deleteStatementById(this.props.statementId);
            toast.success('Statement deleted successfully');
        }
        this.props.deleteValue({
            id: this.props.id,
            propertyId: this.props.propertyId
        });
    };

    handleResourceClick = e => {
        const resource = this.props.resources.byId[this.props.resourceId];
        const existingResourceId = resource.existingResourceId;
        const templateId = resource.templateId;

        if (existingResourceId && !resource.isFechted) {
            this.props.fetchStatementsForResource({
                resourceId: this.props.resourceId,
                existingResourceId
            });
        } else if (templateId && !resource.isFechted) {
            this.props.fetchStructureForTemplate({
                resourceId: this.props.resourceId,
                templateId
            });
        }

        this.props.selectResource({
            increaseLevel: true,
            resourceId: this.props.resourceId,
            label: this.props.label
        });
    };

    handleDatasetResourceClick = ressource => {
        this.props.createResource({
            label: ressource.rlabel ? ressource.rlabel : ressource.label,
            existingResourceId: ressource.id,
            resourceId: ressource.id
        });

        this.props.selectResource({
            increaseLevel: true,
            resourceId: ressource.id,
            label: ressource.rlabel ? ressource.rlabel : ressource.label
        });

        this.props.fetchStatementsForResource({
            resourceId: ressource.id,
            existingResourceId: ressource.id
        });
    };

    handleExistingResourceClick = () => {
        const resource = this.props.resources.byId[this.props.resourceId];
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : this.props.resourceId;
        const templateId = resource.templateId;

        if (templateId && !resource.isFechted) {
            this.props.fetchStructureForTemplate({
                resourceId: this.props.resourceId,
                templateId
            });
        }

        this.setState({
            modal: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label
        });
    };

    handleDatasetClick = () => {
        const resource = this.props.resources.byId[this.props.resourceId];
        const existingResourceId = resource.existingResourceId;
        this.setState({
            modalDataset: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label
        });
    };

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    toggleModalDataset = () => {
        this.setState(prevState => ({
            modalDataset: !prevState.modalDataset
        }));
    };

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(resourcesUrl + encodeURIComponent(valueWithoutHashtag));
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

            let responseJson = await submitGetRequest(
                resourcesUrl +
                    '?q=' +
                    encodeURIComponent(value) +
                    queryParams +
                    `&exclude=${encodeURIComponent(process.env.REACT_APP_CLASSES_CONTRIBUTION + ',' + process.env.REACT_APP_CLASSES_PROBLEM)}`
            );
            responseJson = await this.IdMatch(value, responseJson);

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            const options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id,
                    classes: item.classes,
                    shared: item.shared,
                    type: 'object'
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    onVisibilityChange = visible => {
        this.setState({
            disableHover: visible
        });
    };

    render() {
        const resource = this.props.resources.byId[this.props.resourceId];
        const value = this.props.values.byId[this.props.id];

        const existingResourceId = resource ? resource.existingResourceId : false;
        let hundleOnClick = null;

        if (
            (this.props.type === 'object' || this.props.type === 'template') &&
            (existingResourceId || this.props.contextStyle !== 'StatementBrowser') &&
            this.props.openExistingResourcesInDialog
        ) {
            hundleOnClick = this.handleExistingResourceClick;
        } else if (this.props.type === 'object' || this.props.type === 'template') {
            hundleOnClick = this.handleResourceClick;
        }

        return (
            <>
                {this.props.contextStyle === 'StatementBrowser' ? (
                    <ValueItemSB
                        isProperty={[process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                            this.props.properties.byId[this.props.propertyId].existingPredicateId
                        )}
                        id={this.props.id}
                        value={value}
                        resource={resource}
                        hundleOnClick={hundleOnClick}
                        inline={this.props.inline}
                        loadOptions={this.loadOptions}
                        handleChangeResource={this.handleChangeResource}
                        toggleEditValue={this.props.toggleEditValue}
                        commitChangeLabel={this.commitChangeLabel}
                        commitChangeLiteral={this.commitChangeLiteral}
                        openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                        handleDatasetClick={this.handleDatasetClick}
                        enableEdit={this.props.enableEdit}
                        handleDeleteValue={this.handleDeleteValue}
                    />
                ) : (
                    <ValueItemTemplate
                        isProperty={[process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                            this.props.properties.byId[this.props.propertyId].existingPredicateId
                        )}
                        id={this.props.id}
                        value={value}
                        resource={resource}
                        hundleOnClick={hundleOnClick}
                        inline={this.props.inline}
                        loadOptions={this.loadOptions}
                        handleChangeResource={this.handleChangeResource}
                        toggleEditValue={this.props.toggleEditValue}
                        commitChangeLabel={this.commitChangeLabel}
                        commitChangeLiteral={this.commitChangeLiteral}
                        openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                        handleDatasetClick={this.handleDatasetClick}
                        enableEdit={this.props.enableEdit}
                        handleDeleteValue={this.handleDeleteValue}
                    />
                )}
                {this.state.modal ? (
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={this.toggleModal}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                        newStore={Boolean(this.props.contextStyle === 'StatementBrowser' || existingResourceId)}
                        enableEdit={this.props.enableEdit && this.props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                    />
                ) : (
                    ''
                )}

                {this.state.modalDataset && (
                    <RDFDataCube
                        show={this.state.modalDataset}
                        handleResourceClick={this.handleDatasetResourceClick}
                        toggleModal={this.toggleModalDataset}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    />
                )}
            </>
        );
    }
}

ValueItem.propTypes = {
    deleteValue: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    updateValueLabel: PropTypes.func.isRequired,
    selectResource: PropTypes.func.isRequired,
    createValue: PropTypes.func.isRequired,
    createResource: PropTypes.func.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    fetchStructureForTemplate: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    shared: PropTypes.number.isRequired,
    propertyId: PropTypes.string.isRequired,
    existingStatement: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isSavingValue: PropTypes.func.isRequired,
    doneSavingValue: PropTypes.func.isRequired,
    changeValue: PropTypes.func.isRequired,
    isExistingValue: PropTypes.bool.isRequired,
    resourceId: PropTypes.string,
    statementId: PropTypes.string,
    inline: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool
};

ValueItem.defaultProps = {
    inline: false,
    resourceId: null,
    contextStyle: 'StatementBrowser',
    showHelp: false
};
