import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup } from '@heroui/react';
import { uniq } from 'lodash';
import { ReactElement, useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanAddProperty from '@/components/DataBrowser/hooks/useCanAddProperty';
import useDefaultProperties from '@/components/DataBrowser/hooks/useDefaultProperties';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartPropertyGuidelinesCheck from '@/components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from '@/components/SmartSuggestions/SmartPropertySuggestions';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { Predicate } from '@/services/backend/types';

const AddProperty = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dispatch = useDataBrowserDispatch();
    const { canAddProperty } = useCanAddProperty();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const { templates } = useTemplates();

    const { predicates: _defaultProperties } = useDefaultProperties({ ids: [PREDICATES.SAME_AS, PREDICATES.URL] });

    const scopedNewProperties = entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];
    const allRequiredProperties = templates?.map((t) => getListPropertiesFromTemplate(t, true))?.flat() ?? [];

    const addProperty = (_p: Predicate) => {
        if (entity) {
            dispatch({ type: 'ADD_PROPERTY', payload: { predicate: _p, id: entity.id } });
        }
        setInputValue('');
        setShowAdd(false);
    };

    const propertyLabels = uniq([
        ...allRequiredProperties.map((p) => p.label),
        ...scopedNewProperties.map((p) => p.label),
        ...(statements?.map((s) => s.predicate.label) ?? []),
    ]);

    const propertyIds = uniq([
        ...allRequiredProperties.map((p) => p.id),
        ...scopedNewProperties.map((p) => p.id),
        ...(statements?.map((s) => s.predicate.id) ?? []),
    ]);
    const defaultProperties = _defaultProperties?.filter((p) => !propertyIds.includes(p.id));

    return (
        <div className={`min-h-[34px] ${showAdd ? 'grow min-w-0' : ''}`}>
            <ConditionalWrapper
                condition={!canAddProperty}
                // eslint-disable-next-line react/no-unstable-nested-components
                wrapper={(children: ReactElement) => (
                    <Tooltip content="This resource uses strict template">
                        <span>{children}</span>
                    </Tooltip>
                )}
            >
                {!showAdd ? (
                    <ButtonGroup size="sm">
                        <ButtonWithLoading isDisabled={!canAddProperty} className="button--orkg-secondary" onPress={() => setShowAdd(true)}>
                            <FontAwesomeIcon className="mr-1" icon={faPlus} /> Add property
                        </ButtonWithLoading>
                        {canAddProperty && (
                            <SmartPropertySuggestions
                                properties={propertyLabels}
                                handleCreate={(predicate: Predicate) => addProperty(predicate)}
                                className="!rounded-s-none -ms-px"
                            />
                        )}
                    </ButtonGroup>
                ) : (
                    <div className="flex items-stretch min-h-9">
                        <div className="min-w-0 flex-1 grid relative focus-within:z-10">
                            <Autocomplete
                                entityType={ENTITIES.PREDICATE}
                                size="sm"
                                groupPosition="start"
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
                                    if (e.code === 'Escape') setShowAdd(false);
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
                            />
                        </div>
                        <SmartPropertyGuidelinesCheck label={inputValue} className="!h-9 !rounded-none -ms-px" />
                        <Button
                            variant="secondary"
                            size="sm"
                            isIconOnly
                            aria-label="Cancel"
                            className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                            onPress={() => setShowAdd(false)}
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </div>
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
