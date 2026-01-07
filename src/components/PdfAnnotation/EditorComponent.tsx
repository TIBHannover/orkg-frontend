import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useHotEditor } from '@handsontable/react-wrapper';
import Handsontable from 'handsontable/base';
import { MouseEvent, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import useSWR from 'swr';

import { parseCellString } from '@/app/csv-import/steps/helpers';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import DatatypeSelector from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import InputField from '@/components/InputField/InputField';
import Button from '@/components/Ui/Button/Button';
import InputGroup from '@/components/Ui/Input/InputGroup';
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
    const headerValue = hotInstanceRef.current && col !== undefined ? hotInstanceRef.current.getDataAtCell(0, col) : null;

    const { entityId: headerEntityId } = parseCellString(headerValue || '');

    let dataType = typeStr ?? MISC.DEFAULT_LITERAL_DATATYPE;
    if (headerEntityId && headerEntityId === PREDICATES.HAS_RESEARCH_FIELD && hotInstanceRef.current?.isSurveyTable === true) {
        dataType = ENTITIES.RESOURCE;
    }
    const config = getConfigByType(dataType);

    const { inputFormType } = config;

    if (isLoading) return <Skeleton />;

    if (row === 0 && hotInstanceRef.current?.isSurveyTable === true) {
        return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
                ref={mainElementRef}
                className="tw:hidden tw:absolute tw:left-0 tw:top-0 tw:bg-white tw:border tw:border-black tw:p-4 tw:z-[9999] tw:w-[500px] tw:min-w-[500px]"
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
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            ref={mainElementRef}
            className="tw:hidden tw:absolute tw:left-0 tw:top-0 tw:bg-white tw:border tw:border-black tw:p-4 tw:z-[9999] tw:w-[500px] tw:min-w-[500px]"
            onMouseDown={stopMousedownPropagation}
        >
            <div className="tw:flex tw:items-center tw:w-full">
                <InputGroup size="sm" className="tw:flex-grow-1 tw:flex-nowrap">
                    {(!headerEntityId ||
                        headerEntityId !== PREDICATES.HAS_RESEARCH_FIELD ||
                        (hotInstanceRef.current as ExtendedHandsontable)?.isSurveyTable === false) && (
                        <DatatypeSelector
                            _class={entity && '_class' in entity ? entity._class : undefined}
                            range={undefined}
                            isDisabled={false}
                            dataType={dataType}
                            setDataType={setDataType}
                        />
                    )}
                    <InputField
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
                    <Button className="tw:px-2" size="sm" type="submit" title="Save" color="primary" onClick={finishEditing}>
                        <FontAwesomeIcon icon={faCheck} />
                    </Button>
                </InputGroup>
            </div>
        </div>
    );
};

export default EditorComponent;
