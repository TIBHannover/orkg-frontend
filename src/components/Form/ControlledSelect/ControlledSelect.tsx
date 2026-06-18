import { Description, FieldError, Label, ListBox, Select } from '@heroui/react';
import { FieldValues, useController } from 'react-hook-form';

import { ControlledFieldProps } from '@/components/Form/types';

type SelectOption = {
    id: string;
    label: string;
};

type ControlledSelectProps<T extends FieldValues> = ControlledFieldProps<T> & {
    options: SelectOption[];
    placeholder?: string;
};

const ControlledSelect = <T extends FieldValues>({
    control,
    name,
    label,
    description,
    isDisabled,
    isRequired,
    className,
    options,
    placeholder,
}: ControlledSelectProps<T>) => {
    const { field, fieldState } = useController({ control, name });

    return (
        <Select
            name={field.name}
            value={field.value ?? null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={fieldState.invalid}
            isDisabled={isDisabled}
            isRequired={isRequired}
            placeholder={placeholder}
            className={className}
            fullWidth
        >
            {label && <Label>{label}</Label>}
            <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
                <ListBox>
                    {options.map((option) => (
                        <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
                            {option.label}
                            <ListBox.ItemIndicator />
                        </ListBox.Item>
                    ))}
                </ListBox>
            </Select.Popover>
            {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : description && <Description>{description}</Description>}
        </Select>
    );
};

export default ControlledSelect;
