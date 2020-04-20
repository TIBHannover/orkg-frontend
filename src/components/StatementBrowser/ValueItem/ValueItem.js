import React, { useState } from 'react';
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
import ValueItemTemplate from './ValueItemTemplate';
import PropTypes from 'prop-types';

export default function ValueItem(props) {
    const [modal, setModal] = useState(false);
    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const maxResults = 15;

    const commitChangeLabel = async draftLabel => {
        // Check if the user changed the label
        if (draftLabel !== props.value.label) {
            props.updateValueLabel({
                label: draftLabel,
                valueId: props.id
            });
            if (props.syncBackend) {
                props.isSavingValue({ id: props.id }); // To show the saving message instead of the value label
                if (props.value.resourceId) {
                    if (props.value.type === 'literal') {
                        await updateLiteral(props.value.resourceId, draftLabel);
                        toast.success('Literal label updated successfully');
                    } else {
                        await updateResource(props.value.resourceId, draftLabel);
                        toast.success('Resource label updated successfully');
                    }
                }
                props.doneSavingValue({ id: props.id });
            }
        }
    };

    const handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (props.value.label !== selectedOption.label || props.value.resourceId !== selectedOption.id) {
            props.isSavingValue({ id: props.id }); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                changeValueinStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (props.syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = { id: guid(), isExistingValue: false, label: selectedOption.label, type: 'object', classes: [], shared: 1 };
                }
                await changeValueinStatementBrowser(newResource);
            }
            props.doneSavingValue({ id: props.id });
        }
    };

    const changeValueinStatementBrowser = async newResource => {
        if (props.syncBackend && props.value.statementId) {
            await updateStatement(props.value.statementId, { object_id: newResource.id });
            props.changeValue({
                valueId: props.id,
                ...{
                    classes: newResource.classes,
                    label: newResource.label,
                    resourceId: newResource.id,
                    existingResourceId: newResource.id,
                    isExistingValue: newResource.isExistingValue,
                    existingStatement: true,
                    statementId: props.value.statementId,
                    shared: newResource.shared
                }
            });
            toast.success('Value updated successfully');
        } else {
            props.changeValue({
                valueId: props.id,
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

    const handleDeleteValue = async () => {
        if (props.syncBackend) {
            await deleteStatementById(props.value.statementId);
            toast.success('Statement deleted successfully');
        }
        props.deleteValue({
            id: props.id,
            propertyId: props.propertyId
        });
    };

    const handleResourceClick = e => {
        const resource = props.resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId;
        const templateId = resource.templateId;

        if (existingResourceId && !resource.isFechted) {
            props.fetchStatementsForResource({
                resourceId: props.value.resourceId,
                existingResourceId
            });
        } else if (templateId && !resource.isFechted) {
            props.fetchStructureForTemplate({
                resourceId: props.value.resourceId,
                templateId
            });
        }

        props.selectResource({
            increaseLevel: true,
            resourceId: props.value.resourceId,
            label: props.value.label
        });
    };

    const handleDatasetResourceClick = ressource => {
        props.createResource({
            label: ressource.rlabel ? ressource.rlabel : ressource.label,
            existingResourceId: ressource.id,
            resourceId: ressource.id
        });

        props.selectResource({
            increaseLevel: true,
            resourceId: ressource.id,
            label: ressource.rlabel ? ressource.rlabel : ressource.label
        });

        props.fetchStatementsForResource({
            resourceId: ressource.id,
            existingResourceId: ressource.id
        });
    };

    const handleExistingResourceClick = () => {
        const resource = props.resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : props.value.resourceId;
        const templateId = resource.templateId;

        if (templateId && !resource.isFechted) {
            props.fetchStructureForTemplate({
                resourceId: props.value.resourceId,
                templateId
            });
        }

        setModal(true);
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
    };

    const handleDatasetClick = () => {
        const resource = props.resources.byId[props.value.resourceId];
        const existingResourceId = resource.existingResourceId;

        setModalDataset(true);
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
    };

    const IdMatch = async (value, responseJson) => {
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

    const loadOptions = async value => {
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
            responseJson = await IdMatch(value, responseJson);

            if (responseJson.length > maxResults) {
                responseJson = responseJson.slice(0, maxResults);
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

    const resource = props.resources.byId[props.value.resourceId];
    const value = props.values.byId[props.id];

    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (
        (props.value.type === 'object' || props.value.type === 'template') &&
        (existingResourceId || props.contextStyle !== 'StatementBrowser') &&
        props.openExistingResourcesInDialog
    ) {
        handleOnClick = handleExistingResourceClick;
    } else if (props.value.type === 'object' || props.value.type === 'template') {
        handleOnClick = handleResourceClick;
    }

    return (
        <>
            <ValueItemTemplate
                isProperty={[process.env.REACT_APP_TEMPLATE_COMPONENT_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
                    props.properties.byId[props.propertyId].existingPredicateId
                )}
                id={props.id}
                value={value}
                resource={resource}
                handleOnClick={handleOnClick}
                inline={props.inline}
                loadOptions={loadOptions}
                handleChangeResource={handleChangeResource}
                toggleEditValue={props.toggleEditValue}
                commitChangeLabel={commitChangeLabel}
                handleDatasetClick={handleDatasetClick}
                enableEdit={props.enableEdit}
                handleDeleteValue={handleDeleteValue}
                showHelp={props.showHelp}
                openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                resourcesAsLinks={props.resourcesAsLinks}
            />

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                    newStore={Boolean(props.contextStyle === 'StatementBrowser' || existingResourceId)}
                    enableEdit={props.enableEdit && props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                />
            ) : (
                ''
            )}

            {modalDataset && (
                <RDFDataCube
                    show={modalDataset}
                    handleResourceClick={handleDatasetResourceClick}
                    toggleModal={() => setModalDataset(prev => !prev)}
                    resourceId={dialogResourceId}
                    resourceLabel={dialogResourceLabel}
                />
            )}
        </>
    );
}

ValueItem.propTypes = {
    deleteValue: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    updateValueLabel: PropTypes.func.isRequired,
    selectResource: PropTypes.func.isRequired,
    createResource: PropTypes.func.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    fetchStructureForTemplate: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isSavingValue: PropTypes.func.isRequired,
    doneSavingValue: PropTypes.func.isRequired,
    changeValue: PropTypes.func.isRequired,
    inline: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool,
    resourcesAsLinks: PropTypes.bool.isRequired
};

ValueItem.defaultProps = {
    inline: false,
    resourceId: null,
    contextStyle: 'StatementBrowser',
    showHelp: false
};
