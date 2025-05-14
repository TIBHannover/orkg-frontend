import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import validationSchema from '@/components/ContributionEditor/TableCellForm/helpers/validationSchema';
import { getConfigByClassId, getConfigByType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC } from '@/constants/graphSettings';
import {
    canAddValueAction,
    createResource,
    fetchTemplatesOfClassIfNeeded,
    getPropertyShapesByResourceIDAndPredicateID,
    getValueClass,
    isLiteral,
    updateLiteral,
    updateResourceLabel,
    updateResourceStatementsAction,
} from '@/slices/contributionEditorSlice';

const useTableCellForm = ({ value, contributionId, propertyId }) => {
    const dispatch = useDispatch();
    const editMode = Boolean(value);

    const property = useSelector((state) => state.contributionEditor.properties[propertyId]);
    const { previousInputDataType } = useSelector((state) => state.contributionEditor);
    const valueClass = useSelector((state) => getValueClass(getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId)));
    const propertyShape = useSelector((state) => getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId)?.[0]);

    const canAddValue = useSelector((state) => canAddValueAction(state, contributionId, propertyId));

    const isLiteralField = useSelector((state) => {
        if (editMode) {
            return value._class === ENTITIES.LITERAL;
        }
        return getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId)?.length === 0
            ? true
            : isLiteral(getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId));
    });

    const isUniqLabel = !!(valueClass && valueClass.id === CLASSES.PROBLEM);

    const [entityType, setEntityType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class
            : getConfigByClassId(valueClass.id)._class,
    );

    const [inputValue, setInputValue] = useState(editMode ? value.label : '');
    const [inputDataType, setInputDataType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? (editMode ? value.datatype : previousInputDataType) : previousInputDataType).type
            : getConfigByClassId(valueClass.id).type,
    );
    const [disabledCreate] = useState(false);

    const [inputFormType, setInputFormType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE).inputFormType
            : getConfigByClassId(valueClass.id).inputFormType,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    const isBlankNode = useSelector((state) => {
        if (valueClass && !isLiteralField) {
            if (state.contributionEditor.classes[valueClass.id]?.templateIds) {
                const { templateIds } = state.contributionEditor.classes[valueClass.id];
                // check if it's an inline resource
                for (const templateId of templateIds) {
                    const template = state.contributionEditor.templates[templateId];
                    if (template && !!template.formatted_label) {
                        return template.label;
                    }
                }
                if (!state.contributionEditor.classes[valueClass.id].isFetching) {
                    // in case there is no templates for the class
                    return false;
                }
            }
        }
        return false;
    });

    const createBlankNode = () => {
        // 1 - create a resource
        dispatch(
            createResource({
                contributionId,
                propertyId,
                resourceId: null,
                resourceLabel: isBlankNode,
                action: 'create-option',
                classes: valueClass ? [valueClass.id] : [],
            }),
        )
            .then((newResourceId) => {
                // 2 - open the dialog on that resource
                setDialogResourceId(newResourceId);
                setDialogResourceLabel(isBlankNode);
                setIsModalOpen(true);
            })
            .catch((error) => {});
    };

    useEffect(() => {
        if (valueClass) {
            dispatch(fetchTemplatesOfClassIfNeeded(valueClass.id));
        }
    }, [dispatch, valueClass]);

    const schema = useSelector((state) => {
        const propertyShapes = getPropertyShapesByResourceIDAndPredicateID(state, contributionId, propertyId);
        if (valueClass && getConfigByClassId(valueClass.id)._class === ENTITIES.LITERAL) {
            let propertyShape;
            if (propertyShapes && propertyShapes.length > 0) {
                propertyShape = propertyShapes[0];
            }
            if (!propertyShape) {
                propertyShape = {
                    value: valueClass,
                    property: { id: property.id, label: property.label },
                    min_inclusive: property.min_inclusive,
                    max_inclusive: property.max_inclusive,
                    pattern: property.pattern,
                };
            }
            const _schema = validationSchema(propertyShape);
            return _schema || getConfigByClassId(valueClass.id).schema;
        }
        const config = getConfigByType(inputDataType);
        return config.schema;
    });

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = () => {
        if (valueClass && entityType === ENTITIES.LITERAL) {
            const config = getConfigByClassId(valueClass.id);

            if (config.type !== ENTITIES.RESOURCE) {
                return config.type;
            }
            return MISC.DEFAULT_LITERAL_DATATYPE;
        }
        return getConfigByType(inputDataType).type;
    };

    const updateResourceStatements = (resourceId) => dispatch(updateResourceStatementsAction(resourceId));

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== value.label || draftDataType !== value.datatype) {
            value._class === ENTITIES.LITERAL
                ? dispatch(updateLiteral({ id: value.id, label: draftLabel, datatype: draftDataType }))
                : dispatch(updateResourceLabel({ id: value.id, label: draftLabel }));
        }
    };

    return {
        propertyShape,
        createBlankNode,
        isModalOpen,
        dialogResourceId,
        dialogResourceLabel,
        setIsModalOpen,
        isUniqLabel,
        value,
        valueClass,
        isLiteralField,
        isBlankNode,
        inputDataType,
        inputValue,
        entityType,
        schema,
        canAddValue,
        getDataType,
        setInputDataType,
        setEntityType,
        setInputValue,
        updateResourceStatements,
        disabledCreate,
        commitChangeLabel,
        inputFormType,
        setInputFormType,
    };
};

export default useTableCellForm;
