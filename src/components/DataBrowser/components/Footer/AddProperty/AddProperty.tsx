import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import ConfirmCreatePropertyModal from 'components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import { getListPropertiesFromTemplate } from 'components/DataBrowser/utils/dataBrowserUtils';
import useCanAddProperty from 'components/DataBrowser/hooks/useCanAddProperty';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useTemplates from 'components/DataBrowser/hooks/useTemplates';
import SmartPropertyGuidelinesCheck from 'components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from 'components/SmartSuggestions/SmartPropertySuggestions';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { ENTITIES } from 'constants/graphSettings';
import { uniq } from 'lodash';
import { ReactElement, useState } from 'react';
import { Button, ButtonGroup, InputGroup } from 'reactstrap';
import { Predicate } from 'services/backend/types';

const AddProperty = () => {
    const [showAdd, setShowAdd] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const dispatch = useDataBrowserDispatch();
    const { canAddProperty } = useCanAddProperty();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const { templates } = useTemplates();

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

    return (
        <div className={showAdd ? 'flex-grow-1' : ''}>
            <ConditionalWrapper
                condition={!canAddProperty}
                // eslint-disable-next-line react/no-unstable-nested-components
                wrapper={(children: ReactElement) => (
                    <Tippy content="This resource uses strict template">
                        <span>{children}</span>
                    </Tippy>
                )}
            >
                {!showAdd ? (
                    <ButtonGroup size="sm">
                        <ButtonWithLoading isDisabled={!canAddProperty} color="secondary" onClick={() => setShowAdd(true)}>
                            <Icon className="icon" icon={faPlus} /> Add property
                        </ButtonWithLoading>
                        {canAddProperty && (
                            <SmartPropertySuggestions properties={propertyLabels} handleCreate={(predicate) => addProperty(predicate as Predicate)} />
                        )}
                    </ButtonGroup>
                ) : (
                    <InputGroup size="sm">
                        <span className="input-group-text">
                            <Icon className="icon" icon={faPlus} />
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
                            defaultOptions={[]}
                            inputId="addProperty"
                            onInputChange={(newValue, actionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                        />
                        <SmartPropertyGuidelinesCheck label={inputValue} />
                        <Button color="secondary" title="Cancel" className="w-auto" onClick={() => setShowAdd(false)}>
                            <Icon icon={faClose} />
                        </Button>
                    </InputGroup>
                )}
            </ConditionalWrapper>
            {isModalOpen && (
                <ConfirmCreatePropertyModal
                    label={inputValue}
                    onCreate={(value) => addProperty(value as Predicate)}
                    isOpen={isModalOpen}
                    toggle={() => {
                        setIsModalOpen((v) => !v);
                        setShowAdd(false);
                    }}
                />
            )}
        </div>
    );
};

export default AddProperty;
