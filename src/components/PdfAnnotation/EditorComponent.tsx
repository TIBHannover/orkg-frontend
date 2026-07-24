import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHotEditor } from '@handsontable/react-wrapper';
import { Button, Skeleton } from '@heroui/react';
import Handsontable from 'handsontable/base';
import { MouseEvent, useEffect, useRef } from 'react';
import useSWR from 'swr';

import { parseCellString } from '@/app/csv-import/steps/helpers';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import InputField from '@/components/InputField/InputField';
import { getConfigByType } from '@/constants/DataTypes';
import { CLASSES, ENTITIES, MISC, PREDICATES } from '@/constants/graphSettings';
import errorHandler from '@/helpers/errorHandler';
import { getThing, thingsUrl } from '@/services/backend/things';
import { Node } from '@/services/backend/types';

// Extend Handsontable instance type to include custom property
interface ExtendedHandsontable extends Handsontable {
    isSurveyTable?: boolean;
}

const EditorComponent = () => {
    const mainElementRef = useRef<HTMLDivElement>(null);
    const hotInstanceRef = useRef<ExtendedHandsontable | null>(null);

    useEffect(() => {
        // The React wrapper portals this editor into a body-level
        // <div class="hot-wrapper-editor-container">. When this HotTable is inside a
        // HeroUI Modal, React Aria's ariaHideOutside applies `inert` to it; opt it out
        // so the Autocomplete dropdown and DataType selector stay interactive.
        const wrapper = mainElementRef.current?.closest('.hot-wrapper-editor-container');
        if (wrapper instanceof HTMLElement) {
            wrapper.setAttribute('data-react-aria-top-layer', 'true');
            wrapper.removeAttribute('aria-hidden');
            wrapper.inert = false;
        }
    }, []);

    const { value, setValue, finishEditing, row, col } = useHotEditor<string>({
        onOpen: () => {
            if (!mainElementRef.current) return;

            mainElementRef.current.style.display = 'block';
        },
        onClose: () => {
            if (!mainElementRef.current) return;

            mainElementRef.current.style.display = 'none';
        },
        onPrepare: (_row, _column, _prop, TD, _originalValue, cellProperties) => {
            const tdPosition = TD.getBoundingClientRect();

            // Store the Handsontable instance reference for later use
            if (cellProperties.instance) {
                hotInstanceRef.current = cellProperties.instance as ExtendedHandsontable;
            }

            // As the `prepare` method is triggered after selecting
            // any cell, we're updating the styles for the editor element,
            // so it shows up in the correct position.
            if (!mainElementRef.current) return;
            mainElementRef.current.style.left = `${tdPosition.left + window.pageXOffset}px`;
            mainElementRef.current.style.top = `${tdPosition.top + window.pageYOffset}px`;
        },
        onFocus: () => {},
    });

    const { data: entity, isLoading } = useSWR(
        value && value.startsWith('orkg:') ? [value.replace('orkg:', ''), thingsUrl, 'getThing'] : null,
        ([params]) => getThing(params),
    );

    const stopMousedownPropagation = (e: MouseEvent) => {
        e.stopPropagation();
    };
    const { label, typeStr, hasTypeInfo } = parseCellString(value || '');
    const setDataType = (dt: string) => {
        setValue(`${label}<${dt}>`);
    };

    // Get the value of the cell in the header row of this cell
    // eslint-disable-next-line react-hooks/refs
    const headerValue = hotInstanceRef.current && col !== undefined ? hotInstanceRef.current.getDataAtCell(0, col) : null;

    const { entityId: headerEntityId } = parseCellString(headerValue || '');

    let dataType = typeStr ?? MISC.DEFAULT_LITERAL_DATATYPE;
    // eslint-disable-next-line react-hooks/refs
    if (headerEntityId && headerEntityId === PREDICATES.HAS_RESEARCH_FIELD && hotInstanceRef.current?.isSurveyTable === true) {
        dataType = ENTITIES.RESOURCE;
    }
    const config = getConfigByType(dataType);

    const { inputFormType } = config;

    const showDatatypeSelector =
        !headerEntityId ||
        headerEntityId !== PREDICATES.HAS_RESEARCH_FIELD ||
        // eslint-disable-next-line react-hooks/refs
        (hotInstanceRef.current as ExtendedHandsontable)?.isSurveyTable === false;

    if (isLoading) return <Skeleton className="w-full h-4 rounded" />;

    // eslint-disable-next-line react-hooks/refs
    if (row === 0 && hotInstanceRef?.current?.isSurveyTable === true) {
        return (
            <div
                ref={mainElementRef}
                className="hidden absolute left-0 top-0 bg-surface border border-border p-4 z-[9999] w-[500px] min-w-[500px]"
                onMouseDown={stopMousedownPropagation}
            >
                <Autocomplete
                    entityType={ENTITIES.PREDICATE}
                    placeholder="Enter a property"
                    isMulti={false}
                    onChange={(i, { action }) => {
                        if (action === 'select-option') {
                            setValue(`orkg:${i?.id.toString() || ''}`);
                            finishEditing();
                        }
                    }}
                    inputValue={entity ? undefined : value}
                    onInputChange={(v) => {
                        if (hasTypeInfo) {
                            setValue(`${v}<${typeStr}>`);
                        } else {
                            setValue(v);
                        }
                    }}
                    value={entity ?? undefined}
                    allowCreate={false}
                    enableExternalSources={false}
                    openMenuOnFocus
                    autoFocus
                    size="sm"
                    onFailure={(e) => {
                        errorHandler({ error: e, shouldShowToast: true });
                        finishEditing();
                    }}
                />
            </div>
        );
    }

    return (
        <div
            ref={mainElementRef}
            className="hidden absolute left-0 top-0 bg-surface border border-border p-4 z-[9999] w-[500px] min-w-[500px]"
            onMouseDown={stopMousedownPropagation}
        >
            <div className="flex items-stretch min-h-9 grow min-w-0">
                {showDatatypeSelector && (
                    <DatatypeSelector
                        _class={entity && '_class' in entity ? entity._class : undefined}
                        range={undefined}
                        isDisabled={false}
                        dataType={dataType}
                        setDataType={setDataType}
                    />
                )}
                <InputField
                    groupPosition={showDatatypeSelector ? 'middle' : 'start'}
                    range={undefined}
                    inputValue={label || ''}
                    setInputValue={(v) => {
                        if (hasTypeInfo) {
                            setValue(`${v}<${typeStr}>`);
                        } else {
                            setValue(v);
                        }
                    }}
                    inputFormType={inputFormType}
                    dataType={dataType}
                    isValid
                    placeholder="Enter a value"
                    includeClasses={headerEntityId && headerEntityId === PREDICATES.HAS_RESEARCH_FIELD ? [CLASSES.RESEARCH_FIELD] : []}
                    onChange={(selectedValue: Node | undefined) => {
                        if (selectedValue) {
                            setValue(`orkg:${selectedValue.id.toString()}`);
                            finishEditing();
                        }
                    }}
                    onFailure={(e) => {
                        errorHandler({ error: e, shouldShowToast: true });
                        finishEditing();
                    }}
                />
                <Button
                    size="sm"
                    variant="primary"
                    isIconOnly
                    className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px px-2"
                    type="submit"
                    aria-label="Save"
                    onPress={finishEditing}
                >
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
            </div>
        </div>
    );
};

export default EditorComponent;
