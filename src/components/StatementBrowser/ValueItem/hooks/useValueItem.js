import { useState, useCallback } from 'react';
import {
    selectResource,
    fetchStatementsForResource,
    deleteValue,
    updateValueLabel,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue,
    getValueClass,
    getComponentsByResourceIDAndPredicateID,
    generatedFormattedLabel,
    isLiteral,
    isInlineResource as isInlineResourceUtil
} from 'actions/statementBrowser';
import { uniq } from 'lodash';
import { updateStatement, deleteStatementById } from 'services/backend/statements';
import { createResource as createResourceAPICall, updateResource } from 'services/backend/resources';
import { updateLiteral } from 'services/backend/literals';
import validationSchema from 'components/StatementBrowser/AddValue/helpers/validationSchema';
import { getConfigByType } from 'constants/DataTypes';
import { toast } from 'react-toastify';
import { guid } from 'utils';
import Joi from 'joi';
import { useDispatch, useSelector } from 'react-redux';
import { ENTITIES, MISC } from 'constants/graphSettings';

const useValueItem = ({ valueId, propertyId, syncBackend, contextStyle }) => {
    const dispatch = useDispatch();

    const value = useSelector(state => state.statementBrowser.values.byId[valueId]);
    const property = useSelector(state => state.statementBrowser.properties.byId[propertyId]);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const resource = useSelector(state => state.statementBrowser.resources.byId[value.resourceId]);

    const [draftLabel, setDraftLabel] = useState(value.label);
    const [draftDataType, setDraftDataType] = useState(value.type === 'literal' ? value.datatype : 'object');
    const isInlineResource = useSelector(state => isInlineResourceUtil(state, valueClass));

    const [modal, setModal] = useState(false);
    const [modalDataset, setModalDataset] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const { hasLabelFormat, labelFormat } = useSelector(state => {
        // get all template ids
        let templateIds = [];
        const filter_classes = value?.classes?.filter(c => c) ?? [];
        for (const c of filter_classes) {
            if (state.statementBrowser?.classes?.[c]) {
                templateIds = templateIds.concat(state.statementBrowser?.classes[c]?.templateIds);
            }
        }
        templateIds = uniq(templateIds);
        // check if it formatted label
        let hasLabelFormat = false;
        let labelFormat = '';
        for (const templateId of templateIds) {
            const template = state.statementBrowser.templates[templateId];
            if (template && template.hasLabelFormat) {
                hasLabelFormat = true;
                labelFormat = template.labelFormat;
            }
        }
        return { hasLabelFormat, labelFormat };
    });

    const valueClass = useSelector(state =>
        getValueClass(getComponentsByResourceIDAndPredicateID(state, value.resourceId, property?.existingPredicateId))
    );

    const schema = useSelector(state => {
        const components = getComponentsByResourceIDAndPredicateID(state, value.resourceId, property?.existingPredicateId);
        if (valueClass && ['Date', 'Number', 'String'].includes(valueClass.id)) {
            let component;
            if (components && components.length > 0) {
                component = components[0];
            }
            if (!component) {
                component = {
                    value: valueClass,
                    property: { id: property.id, label: property.label },
                    validationRules: property.validationRules
                };
            }
            const schema = validationSchema(component);
            return schema;
        } else if (value.type === ENTITIES.LITERAL) {
            const config = getConfigByType(draftDataType);
            return config.schema;
        }
        return Joi.string();
    });

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = dt => {
        if (valueClass && value._class === ENTITIES.LITERAL) {
            switch (valueClass.id) {
                case 'String':
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case 'Number':
                    return 'xsd:decimal';
                case 'Date':
                    return 'xsd:date';
                default:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return getConfigByType(dt).type;
        }
    };

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

    const getLabel = useCallback(() => {
        const existingResourceId = resource ? resource.existingResourceId : false;
        if (value.classes) {
            if (!hasLabelFormat) {
                return value.label;
            }
            if (existingResourceId && !resource.isFetched && !resource.isFetching && value?._class !== ENTITIES.LITERAL) {
                dispatch(
                    fetchStatementsForResource({
                        resourceId: existingResourceId
                    })
                ).then(() => {
                    return dispatch(generatedFormattedLabel(resource, labelFormat));
                });
                return dispatch(generatedFormattedLabel(resource, labelFormat));
            } else {
                return dispatch(generatedFormattedLabel(resource, labelFormat));
            }
        } else {
            return value.label;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource, hasLabelFormat, labelFormat]);

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
        modalDataset,
        dialogResourceId,
        dialogResourceLabel,
        setModalDataset,
        openExistingResourcesInDialog,
        handleExistingResourceClick,
        handleResourceClick,
        getLabel,
        schema,
        getDataType,
        draftLabel,
        draftDataType,
        setDraftLabel,
        setDraftDataType,
        valueClass,
        isLiteral,
        isInlineResource
    };
};

export default useValueItem;
