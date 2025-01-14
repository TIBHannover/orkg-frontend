import { faCheck, faClose, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ConfirmationTooltip from 'components/ActionButton/ConfirmationTooltip/ConfirmationTooltip';
import DatatypeSelector from 'components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeSelector';
import InputField from 'components/DataBrowser/components/Body/ValueInputField/InputField/InputField';
import useAddValue from 'components/DataBrowser/hooks/useAddValue';
import SmartLiteralTypeCheck from 'components/SmartSuggestions/SmartLiteralTypeCheck';
import SmartResourceLabelCheck from 'components/SmartSuggestions/SmartResourceLabelCheck';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import a from 'indefinite';
import { FC } from 'react';
import { Button, FormFeedback, InputGroup } from 'reactstrap';
import { Literal, Node, Predicate } from 'services/backend/types';

type ValueInputFieldProps = {
    predicate: Predicate;
    value?: Node | Literal;
    allowCreate?: boolean;
    toggleShowInput: () => void;
};

const ValueInputField: FC<ValueInputFieldProps> = ({ predicate, value, allowCreate = false, toggleShowInput }) => {
    const {
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
    } = useAddValue(predicate, toggleShowInput, value);

    let optionsClasses: string[] = [];
    if (_class === ENTITIES.RESOURCE && range) {
        optionsClasses = [range.id];
    } else if (dataType === 'list') {
        optionsClasses = [CLASSES.LIST];
    }

    return (
        <div className="d-flex flex-column flex-grow-1">
            <InputGroup size="sm" className="flex-grow-1 flex-nowrap">
                <DatatypeSelector
                    _class={editMode && value && '_class' in value ? value._class : undefined}
                    range={range}
                    isDisabled={!!range}
                    dataType={dataType}
                    setDataType={setDataType}
                />
                <InputField
                    range={range}
                    value={value}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    inputFormType={inputFormType}
                    dataType={dataType}
                    isValid
                    placeholder={placeholder}
                    includeClasses={optionsClasses}
                    allowCreate={allowCreate}
                    onChange={(selectedValue) => {
                        if (selectedValue) {
                            handleSubmitValue(_class, selectedValue, true);
                            toggleShowInput();
                        }
                    }}
                />
                {_class === ENTITIES.RESOURCE && <SmartResourceLabelCheck label={inputValue} />}
                {_class === ENTITIES.LITERAL && <SmartLiteralTypeCheck label={inputValue} />}
                <Button
                    size="sm"
                    type="submit"
                    color="secondary"
                    className="px-2"
                    onClick={() => {
                        setFormFeedback(null);
                        toggleShowInput();
                    }}
                    title="Cancel"
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
                <Button
                    className="px-2"
                    size="sm"
                    disabled={dataType !== 'empty' && !inputValue?.toString()}
                    type="submit"
                    color="primary"
                    onClick={onSubmit}
                    title="Save"
                >
                    <Tippy
                        onShown={onConversionTippyShown}
                        onCreate={(instance) => (confirmConversion.current = instance)}
                        content={
                            <ConfirmationTooltip
                                message={
                                    <p className="mb-2">
                                        The value you entered looks like {a(suggestionType?.name || '', { articleOnly: true })}{' '}
                                        <b>{suggestionType?.name}</b>. Do you want to convert it?
                                    </p>
                                }
                                closeTippy={() => confirmConversion?.current?.hide()}
                                ref={confirmButtonRef}
                                buttons={[
                                    {
                                        title: 'Convert',
                                        color: 'success',
                                        icon: faCheck,
                                        action: acceptSuggestion,
                                    },
                                    {
                                        title: 'Keep',
                                        color: 'secondary',
                                        icon: faTimes,
                                        action: rejectSuggestion,
                                    },
                                ]}
                            />
                        }
                        interactive
                        appendTo={document.body}
                        trigger="manual"
                        placement="top"
                    >
                        <span>{editMode ? <FontAwesomeIcon icon={faCheck} /> : 'Create'}</span>
                    </Tippy>
                </Button>
            </InputGroup>
            {!isValid && <FormFeedback className="d-block">{formFeedback}</FormFeedback>}
        </div>
    );
};

export default ValueInputField;
