import { useState, useEffect } from 'react';
import {
    createResource,
    getComponentsByResourceIDAndPredicateID,
    fetchTemplatesOfClassIfNeeded,
    canAddValueAction,
    updateResourceStatementsAction,
    updateLiteral,
    updateResourceLabel
} from 'slices/contributionEditorSlice';
import { getValueClass, isLiteral } from 'actions/statementBrowser';
import validationSchema from 'components/StatementBrowser/ValueForm/helpers/validationSchema';
import { getConfigByType, getConfigByClassId } from 'constants/DataTypes';
import { useDispatch, useSelector } from 'react-redux';
import { ENTITIES, CLASSES, MISC } from 'constants/graphSettings';

const useTableCellForm = ({ value, contributionId, propertyId }) => {
    const dispatch = useDispatch();
    const editMode = Boolean(value);

    const property = useSelector(state => state.contributionEditor.properties[propertyId]);
    const valueClass = useSelector(state => getValueClass(getComponentsByResourceIDAndPredicateID(state, contributionId, propertyId)));

    const canAddValue = useSelector(state => canAddValueAction(state, contributionId, propertyId));

    const isLiteralField = useSelector(state =>
        editMode ? value._class === ENTITIES.LITERAL : isLiteral(getComponentsByResourceIDAndPredicateID(state, contributionId, propertyId))
    );

    const isUniqLabel = valueClass && valueClass.id === CLASSES.PROBLEM ? true : false;

    const [entityType, setEntityType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE)._class
            : getConfigByClassId(valueClass.id)._class
    );

    const [inputValue, setInputValue] = useState(editMode ? value.label : '');
    const [inputDataType, setInputDataType] = useState(
        !valueClass?.id
            ? getConfigByType(isLiteralField ? (editMode ? value.datatype : MISC.DEFAULT_LITERAL_DATATYPE) : MISC.DEFAULT_LITERAL_DATATYPE).type
            : getConfigByClassId(valueClass.id).type
    );
    const [disabledCreate] = useState(false);

    const createBlankNode = () => {
        // 1 - create a resource
        dispatch(
            createResource({
                contributionId,
                propertyId,
                resourceId: null,
                resourceLabel: isBlankNode,
                action: 'create-option',
                classes: valueClass ? [valueClass.id] : []
            })
        )
            .then(newResourceId => {
                // 2 - open the dialog on that resource
                setDialogResourceId(newResourceId);
                setDialogResourceLabel(isBlankNode);
                setIsModalOpen(true);
            })
            .catch(error => {});
    };
    const [isModelOpen, setIsModalOpen] = useState(false);
    const [dialogResourceId, setDialogResourceId] = useState(null);
    const [dialogResourceLabel, setDialogResourceLabel] = useState(null);

    useEffect(() => {
        if (valueClass) {
            dispatch(fetchTemplatesOfClassIfNeeded(valueClass.id));
        }
    }, [dispatch, valueClass]);

    const schema = useSelector(state => {
        const components = getComponentsByResourceIDAndPredicateID(state, contributionId, propertyId);
        if (valueClass && [CLASSES.DATE, CLASSES.DECIMAL, CLASSES.STRING, CLASSES.BOOLEAN, CLASSES.INTEGER, CLASSES.URI].includes(valueClass.id)) {
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
        } else {
            const config = getConfigByType(inputDataType);
            return config.schema;
        }
    });

    const isBlankNode = useSelector(state => {
        if (valueClass && !isLiteralField) {
            if (state.contributionEditor.classes[valueClass.id]?.templateIds) {
                const templateIds = state.contributionEditor.classes[valueClass.id].templateIds;
                //check if it's an inline resource
                for (const templateId of templateIds) {
                    const template = state.contributionEditor.templates[templateId];
                    if (template && template.hasLabelFormat) {
                        return template.label;
                    }
                }
                if (!state.contributionEditor.classes[valueClass.id].isFetching) {
                    // in case there is no templates for the class
                    return false;
                }
            }
        } else {
            return false;
        }
    });

    /**
     * Get the correct xsd datatype if it's literal
     */
    const getDataType = () => {
        if (valueClass && entityType === ENTITIES.LITERAL) {
            switch (valueClass.id) {
                case CLASSES.STRING:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
                case CLASSES.DECIMAL:
                    return 'xsd:decimal';
                case CLASSES.INTEGER:
                    return 'xsd:integer';
                case CLASSES.DATE:
                    return 'xsd:date';
                case CLASSES.BOOLEAN:
                    return 'xsd:boolean';
                case CLASSES.URI:
                    return 'xsd:anyURI';
                default:
                    return MISC.DEFAULT_LITERAL_DATATYPE;
            }
        } else {
            return getConfigByType(inputDataType).type;
        }
    };

    const updateResourceStatements = resourceId => dispatch(updateResourceStatementsAction(resourceId));

    const commitChangeLabel = async (draftLabel, draftDataType) => {
        // Check if the user changed the label
        if (draftLabel !== value.label || draftDataType !== value.datatype) {
            value._class === ENTITIES.LITERAL
                ? dispatch(updateLiteral({ id: value.id, label: draftLabel, datatype: draftDataType }))
                : dispatch(updateResourceLabel({ id: value.id, label: draftLabel }));
        }
    };

    return {
        createBlankNode,
        isModelOpen,
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
        commitChangeLabel
    };
};

export default useTableCellForm;
