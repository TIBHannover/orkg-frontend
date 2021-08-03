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
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import RDFDataCube from 'components/RDFDataCube/RDFDataCube';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createResource as createResourceAPICall, updateResource } from 'services/backend/resources';
import { updateLiteral } from 'services/backend/literals';
import { toast } from 'react-toastify';
import { guid } from 'utils';
import ValueItemTemplate from './ValueItemTemplate';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { PREDICATES } from 'constants/graphSettings';

export default function ValueItem(props) {
    const dispatch = useDispatch();

    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    const property = useSelector(state => state.statementBrowser.properties.byId[props.propertyId]);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const resource = useSelector(state => state.statementBrowser.resources.byId[props.value.resourceId]);

    const [modal, setModal] = useState(false);
    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== props.value.label || draftDataType !== props.value.datatype) {
            dispatch(
                updateValueLabel({
                    label: draftLabel,
                    datatype: draftDataType,
                    valueId: props.id
                })
            );
            if (props.syncBackend) {
                dispatch(isSavingValue({ id: props.id })); // To show the saving message instead of the value label
                if (props.value.resourceId) {
                    if (props.value.type === 'literal') {
                        await updateLiteral(props.value.resourceId, draftLabel, draftDataType);
                        toast.success('Literal updated successfully');
                    } else {
                        await updateResource(props.value.resourceId, draftLabel);
                        toast.success('Resource label updated successfully');
                    }
                }
                dispatch(doneSavingValue({ id: props.id }));
            }
        }
    };

    const handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (props.value.label !== selectedOption.label || props.value.resourceId !== selectedOption.id) {
            dispatch(isSavingValue({ id: props.id })); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                changeValueInStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (props.syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = { id: guid(), isExistingValue: false, label: selectedOption.label, type: 'object', classes: [], shared: 1 };
                }
                await changeValueInStatementBrowser(newResource);
            }
            dispatch(doneSavingValue({ id: props.id }));
        }
    };

    const changeValueInStatementBrowser = async newResource => {
        if (props.syncBackend && props.value.statementId) {
            await updateStatement(props.value.statementId, { object_id: newResource.id });
            dispatch(
                changeValue({
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
                })
            );
            toast.success('Value updated successfully');
        } else {
            dispatch(
                changeValue({
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
                })
            );
        }
    };

    const handleDeleteValue = async () => {
        if (props.syncBackend) {
            await deleteStatementById(props.value.statementId);
            toast.success('Statement deleted successfully');
        }
        dispatch(
            deleteValue({
                id: props.id,
                propertyId: props.propertyId
            })
        );
    };

    const handleResourceClick = async e => {
        const existingResourceId = resource.existingResourceId;

        if (existingResourceId) {
            dispatch(
                fetchStatementsForResource({
                    resourceId: props.value.resourceId,
                    existingResourceId,
                    depth: 3
                })
            );
        }

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: props.value.resourceId,
                label: props.value.label,
                propertyLabel: property?.label
            })
        );
    };

    const handleDatasetResourceClick = ressource => {
        dispatch(
            createResource({
                label: ressource.rlabel ? ressource.rlabel : ressource.label,
                existingResourceId: ressource.id,
                resourceId: ressource.id
            })
        );

        dispatch(
            selectResource({
                increaseLevel: true,
                resourceId: ressource.id,
                label: ressource.rlabel ? ressource.rlabel : ressource.label,
                propertyLabel: property?.label
            })
        );

        dispatch(
            fetchStatementsForResource({
                resourceId: ressource.id,
                existingResourceId: ressource.id
            })
        );
    };

    const handleExistingResourceClick = async () => {
        const existingResourceId = resource.existingResourceId ? resource.existingResourceId : props.value.resourceId;

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

    if (
        (props.value.type === 'object' || props.value.type === 'template') &&
        (existingResourceId || props.contextStyle !== 'StatementBrowser') &&
        openExistingResourcesInDialog
    ) {
        handleOnClick = handleExistingResourceClick;
    } else if (props.value.type === 'object' || props.value.type === 'template') {
        handleOnClick = handleResourceClick;
    }

    return (
        <>
            <ValueItemTemplate
                isProperty={[PREDICATES.TEMPLATE_COMPONENT_PROPERTY, PREDICATES.TEMPLATE_OF_PREDICATE].includes(property?.existingPredicateId)}
                id={props.id}
                value={value}
                resource={resource}
                predicate={property}
                handleOnClick={handleOnClick}
                handleChangeResource={handleChangeResource}
                commitChangeLabel={commitChangeLabel}
                handleDatasetClick={handleDatasetClick}
                enableEdit={props.enableEdit}
                handleDeleteValue={handleDeleteValue}
                showHelp={props.showHelp}
                components={props.components}
            />

            {modal ? (
                <StatementBrowserDialog
                    show={modal}
                    toggleModal={() => setModal(prev => !prev)}
                    id={dialogResourceId}
                    label={dialogResourceLabel}
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
    value: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    contextStyle: PropTypes.string.isRequired,
    showHelp: PropTypes.bool,
    components: PropTypes.array.isRequired
};

ValueItem.defaultProps = {
    contextStyle: 'StatementBrowser',
    showHelp: false
};
