import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { flatten, uniq } from 'lodash';
import { ReactElement, useState } from 'react';

import { useGridDispatch, useGridState } from '@/app/grid-editor/context/GridContext';
import useCanAddProperty from '@/app/grid-editor/hooks/useCanAddProperty';
import useGridEditor from '@/app/grid-editor/hooks/useGridEditor';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import useDefaultProperties from '@/components/DataBrowser/hooks/useDefaultProperties';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartPropertyGuidelinesCheck from '@/components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from '@/components/SmartSuggestions/SmartPropertySuggestions';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import InputGroup from '@/components/Ui/Input/InputGroup';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { Predicate } from '@/services/backend/types';

const AddProperty = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dispatch = useGridDispatch();
    const { canAddProperty } = useCanAddProperty();
    const { newProperties } = useGridState();
    const { statements } = useGridEditor();
    const { templates } = useTemplates();

    const { predicates: _defaultProperties } = useDefaultProperties({ ids: [PREDICATES.SAME_AS, PREDICATES.URL] });

    const allRequiredProperties = templates?.map((t) => getListPropertiesFromTemplate(t, true))?.flat() ?? [];

    const addProperty = (_p: Predicate) => {
        dispatch({ type: 'ADD_PROPERTY', payload: { predicate: _p } });
        setInputValue('');
        setShowAdd(false);
    };

    const propertyLabels = uniq([
        ...allRequiredProperties.map((p) => p.label),
        ...newProperties.map((p) => p.label),
        ...(flatten(statements ?? [])
            ?.map((s) => s.predicate?.label)
            .filter(Boolean) ?? []),
    ]);

    // Filter out the already existing default properties
    const propertyIds = uniq([
        ...allRequiredProperties.map((p) => p.id),
        ...newProperties.map((p) => p.id),
        ...(flatten(statements ?? [])
            ?.map((s) => s.predicate?.id)
            .filter(Boolean) ?? []),
    ]);
    const defaultProperties = _defaultProperties?.filter((p) => !propertyIds.includes(p.id));

    return (
        <div className={showAdd ? 'tw:flex-1' : ''}>
            <ConditionalWrapper
                condition={!canAddProperty}
                // eslint-disable-next-line react/no-unstable-nested-components
                wrapper={(children: ReactElement) => (
                    <Tooltip content="This resources use a strict template">
                        <span>{children}</span>
                    </Tooltip>
                )}
            >
                {!showAdd ? (
                    <ButtonGroup size="sm">
                        <ButtonWithLoading isDisabled={!canAddProperty} color="secondary" onClick={() => setShowAdd(true)}>
                            <FontAwesomeIcon className="tw:mr-2 tw:h-4 tw:w-4" icon={faPlus} /> Add property
                        </ButtonWithLoading>
                        {canAddProperty && (
                            <SmartPropertySuggestions properties={propertyLabels} handleCreate={(predicate: Predicate) => addProperty(predicate)} />
                        )}
                    </ButtonGroup>
                ) : (
                    <InputGroup size="sm">
                        <span className="input-group-text">
                            <FontAwesomeIcon className="tw:h-4 tw:w-4" icon={faPlus} />
                        </span>

                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            size="sm"
                            placeholder="Select or type to enter a property"
                            onChange={(value, { action }) => {
                                if (action === 'select-option') {
                                    addProperty(value as Predicate);
                                } else if (action === 'create-option' && value) {
                                    setInputValue(value.label);
                                    setIsModalOpen(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.code === 'Escape') {
                                    setShowAdd(false);
                                }
                            }}
                            allowCreate
                            autoFocus
                            defaultOptions={defaultProperties ?? []}
                            inputId="addProperty"
                            onInputChange={(newValue, actionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                            className="tw:flex-1 tw:min-w-0"
                        />
                        <SmartPropertyGuidelinesCheck label={inputValue} />
                        <Button color="secondary" title="Cancel" onClick={() => setShowAdd(false)}>
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </InputGroup>
                )}
            </ConditionalWrapper>
            {isModalOpen && (
                <ConfirmCreatePropertyModal
                    label={inputValue}
                    onCreate={(value) => addProperty(value as Predicate)}
                    isOpen={isModalOpen}
                    toggle={() => setIsModalOpen((v) => !v)}
                />
            )}
        </div>
    );
};

export default AddProperty;
