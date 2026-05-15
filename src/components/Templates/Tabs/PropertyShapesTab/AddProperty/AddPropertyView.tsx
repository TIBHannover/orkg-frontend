import { faClose, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Tooltip } from '@heroui/react';
import { FC, useState } from 'react';
import { ActionMeta, InputActionMeta, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import SmartPropertyGuidelinesCheck from '@/components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import SmartPropertySuggestions from '@/components/SmartSuggestions/SmartPropertySuggestions';
import defaultProperties from '@/constants/defaultProperties';
import { ENTITIES } from '@/constants/graphSettings';

type AddPropertyViewProps = {
    showAddProperty: boolean;
    setShowAddProperty: (show: boolean) => void;
    handlePropertySelect: (value: { id: string; label: string }) => void;
    toggleConfirmNewProperty: (label: string) => void;
    isDisabled?: boolean;
    isLoading?: boolean;
};

const AddPropertyView: FC<AddPropertyViewProps> = ({
    isDisabled = false,
    isLoading = false,
    showAddProperty,
    setShowAddProperty,
    handlePropertySelect,
    toggleConfirmNewProperty,
}) => {
    const [inputValue, setInputValue] = useState('');
    const propertyLabels: string[] = [];

    const addPropertyButton = (
        <ButtonGroup size="sm">
            <ButtonWithLoading
                className="button--orkg-secondary"
                isDisabled={isDisabled || isLoading}
                onPress={() => setShowAddProperty(true)}
                size="sm"
                isLoading={isLoading}
            >
                <FontAwesomeIcon icon={faPlus} /> Add property
            </ButtonWithLoading>
            {!isDisabled && (
                <SmartPropertySuggestions
                    properties={propertyLabels}
                    handleCreate={({ id, label }) => handlePropertySelect({ id, label })}
                    className="!rounded-s-none -ms-px"
                />
            )}
        </ButtonGroup>
    );

    const addPropertyWithTooltip = isDisabled ? (
        <Tooltip>
            <Tooltip.Trigger>
                <span className="inline-flex">{addPropertyButton}</span>
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                This resource uses strict template
            </Tooltip.Content>
        </Tooltip>
    ) : (
        addPropertyButton
    );

    return (
        <div className="mt-4">
            {isLoading || !showAddProperty ? (
                addPropertyWithTooltip
            ) : (
                <div className="flex items-stretch min-h-8">
                    <div className="min-w-0 flex-1">
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            size="sm"
                            placeholder="Select or type to enter a property"
                            onChange={(value: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
                                if (action === 'select-option' && value) {
                                    handlePropertySelect({ id: value.id, label: value.label });
                                } else if (action === 'create-option' && value) {
                                    toggleConfirmNewProperty(value.label);
                                } else if (action === 'clear') {
                                    setInputValue('');
                                }
                            }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                                if (e.key === 'Escape') {
                                    setShowAddProperty(false);
                                }
                            }}
                            allowCreate
                            autoFocus
                            defaultOptions={defaultProperties}
                            inputId="addProperty"
                            onInputChange={(newValue: string, actionMeta: InputActionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                        />
                    </div>
                    <SmartPropertyGuidelinesCheck label={inputValue} className="!h-8 !rounded-none -ms-px" />
                    <Button
                        variant="secondary"
                        size="sm"
                        isIconOnly
                        aria-label="Cancel"
                        className="!h-8 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                        onPress={() => setShowAddProperty(false)}
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AddPropertyView;
