import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import useConstraints from '@/app/grid-editor/hooks/useConstraints';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import { commitChangeLabel, convertPropertyShapeToSchema, createValue } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { DataType, getConfigByClassId, getConfigByType, getSuggestionByTypeAndValue, InputType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC } from '@/constants/graphSettings';
import { createStatement, updateStatement } from '@/services/backend/statements';
import { Thing } from '@/services/backend/things';
import { Class, EntityType, Node, Predicate, Resource, Statement } from '@/services/backend/types';

const useSaveValue = (
    subjectId: string,
    predicate: Predicate,
    statement: Statement,
    onSuccess?: (statementId: string) => void,
    stopEditing?: () => void,
) => {
    const { getRanges, getPropertyShapes, isLiteralField } = useConstraints();
    const ranges = getRanges(predicate.id, subjectId);
    const propertyShapes = getPropertyShapes(predicate.id, subjectId);

    const { entities } = useEntities();
    const entity = entities?.find((e: Thing) => e.id === subjectId);

    const range = ranges.length > 0 ? ranges[0] : undefined;
    const propertyShape = propertyShapes.length > 0 ? propertyShapes[0] : undefined;

    const editMode = !!statement?.object;
    const value = statement?.object;
    const [inputValue, setInputValue] = useState(editMode ? value?.label : '');

    const initialDataType = !range?.id
        ? getConfigByType(isLiteralField(predicate.id, subjectId) ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE).type
        : getConfigByClassId(range.id).type;

    const [dataType, setDataType] = useState(editMode && 'datatype' in statement.object ? statement.object.datatype : initialDataType);

    const _class = !range?.id ? getConfigByType(dataType)._class : getConfigByClassId(range.id)._class;

    const [suggestionType, setSuggestionType] = useState<DataType | null>(null);
    const [formFeedback, setFormFeedback] = useState<string | null>(null);
    const [isConversionTippyOpen, setIsConversionTippyOpen] = useState(false);
    const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

    const onConversionTippyShown = () => confirmButtonRef?.current?.focus();

    const { schema, name: dataTypeName } = getConfigByType(dataType);

    const propertySchema = propertyShape ? convertPropertyShapeToSchema(propertyShape) : schema;

    const handleSubmitValue = async (
        entityType: EntityType | 'empty',
        v: Resource | Predicate | Node | { label: string; datatype: string } | Class,
        existingValue?: boolean,
    ) => {
        if (!entity) return;
        let apiCall;
        let statementId: string;
        if (statement?.id) {
            statementId = statement.id;
        }
        if (editMode && entityType === ENTITIES.LITERAL && value.id) {
            apiCall = commitChangeLabel(value.id, entityType, inputValue, 'datatype' in v ? v.datatype : dataType);
        } else if (existingValue && editMode && value.id && 'id' in v && statement?.id) {
            apiCall = updateStatement(statement?.id, { object_id: v.id });
        } else if (!existingValue && editMode && statement?.id) {
            const newObject = await createValue(entityType, { ...v, ...(range?.id && range.id !== CLASSES.RESOURCE && { classes: [range.id] }) });
            apiCall = updateStatement(statement?.id, { object_id: newObject.id });
        } else if (!existingValue) {
            const newObject = await createValue(entityType, { ...v, ...(range?.id && range.id !== CLASSES.RESOURCE && { classes: [range.id] }) });
            apiCall = createStatement(entity?.id, predicate?.id, newObject.id).then(async (response) => {
                statementId = response;
            });
        } else if (existingValue && 'id' in v) {
            apiCall = createStatement(entity?.id, predicate?.id, v.id).then((response) => {
                statementId = response;
            });
        }
        if (apiCall) {
            await apiCall
                .then(() => {
                    // Call onSuccess with the statement ID instead of the full statement
                    onSuccess?.(statementId);
                })
                .catch(() => {
                    toast.error('Something went wrong while adding the value.');
                });
        }
    };

    const onSubmit = () => {
        let error;
        if (schema) {
            error = schema.safeParse(inputValue.trim()).error;
        }
        if (error) {
            setFormFeedback(error.errors?.[0]?.message);
            return;
        }
        if (propertySchema) {
            error = propertySchema.safeParse(inputValue.trim()).error;
        }
        if (error) {
            setFormFeedback(error.errors?.[0]?.message);
        } else {
            setFormFeedback(null);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(dataType, inputValue.trim());
            if (suggestions.length > 0 && !range) {
                setSuggestionType(suggestions[0]);
                setIsConversionTippyOpen(true);
            } else {
                handleSubmitValue(_class, { label: inputValue.trim(), datatype: dataType });
                stopEditing?.();
            }
        }
    };

    const acceptSuggestion = () => {
        if (suggestionType) {
            handleSubmitValue(suggestionType?._class, { label: inputValue.trim(), datatype: suggestionType?.type });
            setDataType(suggestionType?.type ?? dataType);
            setIsConversionTippyOpen(false);
            stopEditing?.();
        }
    };

    const rejectSuggestion = () => {
        handleSubmitValue(_class, { label: inputValue.trim(), datatype: dataType });
        stopEditing?.();
    };

    const placeholder = propertyShape?.placeholder ? propertyShape.placeholder : `Enter a ${dataTypeName}`;

    const isValid = !formFeedback;
    let inputFormType: InputType = isLiteralField(predicate.id, subjectId) ? 'text' : 'autocomplete';
    if (range?.id && CLASSES.DATE === range.id) {
        inputFormType = 'date';
    } else if (range?.id && CLASSES.BOOLEAN === range.id) {
        inputFormType = 'boolean';
    } else if (dataType !== ENTITIES.RESOURCE) {
        const config = getConfigByType(dataType);
        inputFormType = config.inputFormType;
    }

    useEffect(() => {
        if (dataType === 'xsd:boolean') {
            setInputValue((v) => Boolean(v === 'true').toString());
        }
    }, [dataType, setInputValue]);

    return {
        editMode,
        _class,
        range,
        placeholder,
        inputFormType,
        dataType,
        setDataType,
        inputValue,
        setInputValue,
        onSubmit,
        acceptSuggestion,
        rejectSuggestion,
        handleSubmitValue,
        onConversionTippyShown,
        suggestionType,
        isConversionTippyOpen,
        setIsConversionTippyOpen,
        isValid,
        formFeedback,
        setFormFeedback,
    };
};

export default useSaveValue;
