import { commitChangeLabel, createValue } from 'components/DataBrowser/utils/dataBrowserUtils';
import useConstraints from 'components/DataBrowser/hooks/useConstraints';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useHistory from 'components/DataBrowser/hooks/useHistory';
import { DataType, getConfigByClassId, getConfigByType, getSuggestionByTypeAndValue, InputType } from 'constants/DataTypes';
import { CLASSES, ENTITIES, MISC, PREDICATES } from 'constants/graphSettings';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getList, listsUrl, updateList } from 'services/backend/lists';
import { createResourceStatement, statementsUrl } from 'services/backend/statements';
import { Class, EntityType, Literal, Node, Predicate, Resource } from 'services/backend/types';
import useSWR, { useSWRConfig } from 'swr';
import type { Instance } from 'tippy.js';

const useAddValue = (predicate: Predicate, toggleShowInput: () => void, value?: Node | Literal) => {
    const { ranges, propertyShapes, isLiteralField } = useConstraints(predicate.id);
    const { entity, mutateStatements } = useEntity();
    const { getPreviousId } = useHistory();
    const { mutate } = useSWRConfig();
    const range = ranges.length > 0 ? ranges[0] : undefined;
    const propertyShape = propertyShapes.length > 0 ? propertyShapes[0] : undefined;

    const editMode = !!value;

    const [inputValue, setInputValue] = useState(editMode ? value?.label : '');

    const initialDataType = !range?.id
        ? getConfigByType(isLiteralField ? MISC.DEFAULT_LITERAL_DATATYPE : ENTITIES.RESOURCE).type
        : getConfigByClassId(range.id).type;

    const [dataType, setDataType] = useState(editMode && 'datatype' in value ? value.datatype : initialDataType);

    const _class = !range?.id ? getConfigByType(dataType)._class : getConfigByClassId(range.id)._class;

    const [suggestionType, setSuggestionType] = useState<DataType | null>(null);
    const [formFeedback, setFormFeedback] = useState<string | null>(null);

    const confirmConversion = useRef<Instance | null>(null);
    const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

    const onConversionTippyShown = () => confirmButtonRef?.current?.focus();

    const { schema, name: dataTypeName } = getConfigByType(dataType);

    const isList = entity && 'classes' in entity && entity.classes.includes(CLASSES.LIST) && predicate.id === PREDICATES.HAS_LIST_ELEMENT;

    const { data: originalOrder, mutate: mutateList } = useSWR(isList ? [entity?.id, listsUrl, 'getList'] : null, ([_params]) => getList(_params));

    const handleSubmitValue = async (
        entityType: EntityType | 'empty',
        v: Resource | Predicate | Node | { label: string; datatype: string } | Class,
        existingValue?: boolean,
    ) => {
        if (!entity) return;
        let apiCall;
        if (editMode && entityType !== 'empty') {
            apiCall = commitChangeLabel(value.id, entityType, inputValue, dataType);
        } else if (!existingValue) {
            apiCall = createValue(entityType, { ...v, ...(range?.id && { classes: [range.id] }) }).then(async (response) => {
                if (isList) {
                    await updateList({
                        id: entity?.id,
                        elements: [...(originalOrder?.elements ?? []), response.id],
                    });
                    mutateList();
                } else {
                    await createResourceStatement(entity?.id, predicate?.id, response.id);
                }
            });
        } else if (existingValue && 'id' in v) {
            if (isList) {
                apiCall = updateList({
                    id: entity?.id,
                    elements: [...(originalOrder?.elements ?? []), v.id],
                });
                mutateList();
            } else {
                apiCall = createResourceStatement(entity?.id, predicate?.id, v.id);
            }
        }
        if (apiCall) {
            await apiCall
                .then(() => {
                    mutateStatements();
                    // mutateStatements for the upper level (for formatted labels)
                    const previousId = getPreviousId(entity.id);
                    if (previousId) {
                        mutate([{ subjectId: previousId, returnContent: true, returnFormattedLabels: true }, statementsUrl, 'getStatements']);
                    }
                })
                .catch(() => {
                    toast.error('Something went wrong while adding the value.');
                });
        }
    };

    const onSubmit = () => {
        let error;
        if (schema) {
            error = schema.validate(inputValue).error;
        }
        if (error) {
            setFormFeedback(error.message);
        } else {
            setFormFeedback(null);
            // Check for a possible conversion possible
            const suggestions = getSuggestionByTypeAndValue(dataType, inputValue);
            if (suggestions.length > 0 && !range) {
                setSuggestionType(suggestions[0]);
                confirmConversion?.current?.show();
            } else {
                handleSubmitValue(_class, { label: inputValue, datatype: dataType });
                toggleShowInput();
            }
        }
    };

    const acceptSuggestion = () => {
        if (suggestionType) {
            confirmConversion?.current?.hide();
            handleSubmitValue(suggestionType?._class, { label: inputValue, datatype: suggestionType?.type });
            setDataType(suggestionType?.type ?? dataType);
            toggleShowInput();
        }
    };

    const rejectSuggestion = () => {
        handleSubmitValue(_class, { label: inputValue, datatype: dataType });
        toggleShowInput();
    };

    const placeholder = propertyShape?.placeholder ? propertyShape.placeholder : `Enter a ${dataTypeName}`;

    const isValid = !formFeedback;
    let inputFormType: InputType = isLiteralField ? 'text' : 'autocomplete';
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
        confirmConversion,
        confirmButtonRef,
        isValid,
        formFeedback,
        setFormFeedback,
    };
};

export default useAddValue;
