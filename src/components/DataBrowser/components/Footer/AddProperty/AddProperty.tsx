import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniq } from 'lodash';
import { ReactElement, useState } from 'react';
import { Button, ButtonGroup, InputGroup } from 'reactstrap';

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

    // Filter out the already existing default properties
    const propertyIds = uniq([
        ...allRequiredProperties.map((p) => p.id),
        ...scopedNewProperties.map((p) => p.id),
        ...(statements?.map((s) => s.predicate.id) ?? []),
    ]);
    const defaultProperties = _defaultProperties?.filter((p) => !propertyIds.includes(p.id));

    return (
        <div className={showAdd ? 'flex-grow-1' : ''}>
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
                        <ButtonWithLoading isDisabled={!canAddProperty} color="secondary" onClick={() => setShowAdd(true)}>
                            <FontAwesomeIcon className="icon" icon={faPlus} /> Add property
                        </ButtonWithLoading>
                        {canAddProperty && (
                            <SmartPropertySuggestions properties={propertyLabels} handleCreate={(predicate) => addProperty(predicate as Predicate)} />
                        )}
                    </ButtonGroup>
                ) : (
                    <InputGroup size="sm">
                        <span className="input-group-text">
                            <FontAwesomeIcon className="icon" icon={faPlus} />
                        </span>

                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            size="sm"
                            placeholder="Select or type to enter a property"
                            onChange={(value, { action }) => {
                                if (action === 'select-option') {
                                    addProperty(value as Predicate);
                                } else if (action === 'create-option' && value) {
                                    // toggleConfirmNewProperty(value.label);
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
                        />
                        <SmartPropertyGuidelinesCheck label={inputValue} />
                        <Button color="secondary" title="Cancel" className="w-auto" onClick={() => setShowAdd(false)}>
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
