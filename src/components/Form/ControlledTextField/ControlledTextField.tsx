import { Description, FieldError, Input, InputGroup, Label, TextField } from '@heroui/react';
import { ReactNode } from 'react';
import { FieldValues, useController } from 'react-hook-form';

import { ControlledFieldProps } from '@/components/Form/types';

type ControlledTextFieldProps<T extends FieldValues> = ControlledFieldProps<T> & {
    placeholder?: string;
    maxLength?: number;
    type?: 'text' | 'url' | 'email' | 'password' | 'tel' | 'search';
    prefix?: ReactNode;
};

const ControlledTextField = <T extends FieldValues>({
    control,
    name,
    label,
    description,
    isDisabled,
    isRequired,
    className,
    placeholder,
    maxLength,
    type = 'text',
    prefix,
}: ControlledTextFieldProps<T>) => {
    const { field, fieldState } = useController({ control, name });

    return (
        <TextField
            {...field}
            fullWidth
            type={type}
            isInvalid={fieldState.invalid}
            isDisabled={isDisabled}
            isRequired={isRequired}
            className={className}
        >
            {label && <Label>{label}</Label>}
            {prefix ? (
                <InputGroup>
                    <InputGroup.Prefix>{prefix}</InputGroup.Prefix>
                    <InputGroup.Input placeholder={placeholder} maxLength={maxLength} />
                </InputGroup>
            ) : (
                <Input placeholder={placeholder} maxLength={maxLength} />
            )}
            {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : description && <Description>{description}</Description>}
        </TextField>
    );
};

export default ControlledTextField;
