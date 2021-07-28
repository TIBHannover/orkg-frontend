import { useState } from 'react';
import {
    selectResource,
    fetchStatementsForResource,
    deleteValue,
    updateValueLabel,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue
} from 'actions/statementBrowser';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createResource as createResourceAPICall, updateResource } from 'services/backend/resources';
import { updateLiteral } from 'services/backend/literals';
import { toast } from 'react-toastify';
import { guid } from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';

const useValueItem = ({ valueId, propertyId, syncBackend, contextStyle }) => {
    const dispatch = useDispatch();

    const value = useSelector(state => state.statementBrowser.values.byId[valueId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);

    const [modal, setModal] = useState(false);
    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== value.label || draftDataType !== value.datatype) {
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    datatype: draftDataType,
                    valueId: valueId
                })
            );
            if (syncBackend) {
                dispatch(isSavingValue({ id: valueId })); // To show the saving message instead of the value label
                if (value.resourceId) {
                    if (value._class === ENTITIES.LITERAL) {
                        await updateLiteral(value.resourceId, draftLabel, draftDataType);
                        toast.success('Literal updated successfully');
                    } else {
                        await updateResource(value.resourceId, draftLabel);
                        toast.success('Resource label updated successfully');
                    }
                }
                dispatch(doneSavingValue({ id: valueId }));
            }
        }
    };

    const handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (value.label !== selectedOption.label || value.resourceId !== selectedOption.id) {
            dispatch(isSavingValue({ id: valueId })); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                changeValueInStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = {
                        id: guid(),
                        isExistingValue: false,
                        label: selectedOption.label,
                        _class: ENTITIES.RESOURCE,
                        classes: [],
                        shared: 1
                    };
                }
                await changeValueInStatementBrowser(newResource);
            }
            dispatch(doneSavingValue({ id: valueId }));
        }
    };

    const changeValueInStatementBrowser = async newResource => {
        if (syncBackend && value.statementId) {
            await updateStatement(value.statementId, { object_id: newResource.id });
            dispatch(
                changeValue({
                    valueId: valueId,
                    ...{
                        classes: newResource.classes,
                        label: newResource.label,
                        resourceId: newResource.id,
                        existingResourceId: newResource.id,
                        isExistingValue: newResource.isExistingValue,
                        existingStatement: true,
                        statementId: value.statementId,
                        shared: newResource.shared
                    }
                })
            );
            toast.success('Value updated successfully');
        } else {
            dispatch(
                changeValue({
                    valueId: valueId,
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
                })
            );
        }
    };

    const handleDeleteValue = async () => {
        if (syncBackend) {
            await deleteStatementById(value.statementId);
            toast.success('Statement deleted successfully');
        }
        dispatch(
            deleteValue({
                id: valueId,
                propertyId: propertyId
            })
        );
    };

    const handleResourceClick = async e => {
        const existingResourceId = resource.existingResourceId;

        if (existingResourceId) {
            dispatch(
                fetchStatementsForResource({
                    resourceId: existingResourceId,
                    depth: 3
                })
            );
        }

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: value.resourceId,
                label: value.label,
                propertyLabel: property?.label
            })
        );
    };

    const handleDatasetResourceClick = resource => {
        dispatch(
            createResource({
                label: resource.rlabel ? resource.rlabel : resource.label,
                existingResourceId: resource.id,
                resourceId: resource.id
            })
        );

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: resource.id,
                label: resource.rlabel ? resource.rlabel : resource.label,
                propertyLabel: property?.label
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: resource.id
            })
        );
    };

    const handleExistingResourceClick = async () => {
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : value.resourceId;

        // Load template of this class
        //show the statement browser
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
        setModal(true);
    };

    const handleDatasetClick = () => {
        const existingResourceId = resource.existingResourceId;

        setModalDataset(true);
        setDialogResourceId(existingResourceId);
        setDialogResourceLabel(resource.label);
    };

    const existingResourceId = resource ? resource.existingResourceId : false;
    let handleOnClick = null;

    if (value._class === ENTITIES.RESOURCE && (existingResourceId || contextStyle !== 'StatementBrowser') && openExistingResourcesInDialog) {
        handleOnClick = handleExistingResourceClick;
    } else if (value._class === ENTITIES.RESOURCE) {
        handleOnClick = handleResourceClick;
    }

    return {
        resource,
        value,
        modal,
        setModal,
        property,
        commitChangeLabel,
        handleChangeResource,
        handleDeleteValue,
        handleDatasetResourceClick,
        handleDatasetClick,
        handleOnClick,
        modalDataset,
        dialogResourceId,
        dialogResourceLabel,
        existingResourceId,
        setModalDataset
    };
};

export default useValueItem;
