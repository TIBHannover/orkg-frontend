import { Description, FieldError, Label, TextArea, TextField } from '@heroui/react';
import { FieldValues, useController } from 'react-hook-form';

import { ControlledFieldProps } from '@/components/Form/types';

type ControlledTextAreaProps<T extends FieldValues> = ControlledFieldProps<T> & {
    placeholder?: string;
    maxLength?: number;
    rows?: number;
};

const ControlledTextArea = <T extends FieldValues>({
    control,
    name,
    label,
    description,
    isDisabled,
    isRequired,
    className,
    placeholder,
    maxLength,
    rows = 4,
}: ControlledTextAreaProps<T>) => {
    const { field, fieldState } = useController({ control, name });

    return (
        <TextField {...field} fullWidth isInvalid={fieldState.invalid} isDisabled={isDisabled} isRequired={isRequired} className={className}>
            {label && <Label>{label}</Label>}
            <TextArea placeholder={placeholder} maxLength={maxLength} rows={rows} />
            {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : description && <Description>{description}</Description>}
        </TextField>
    );
};

export default ControlledTextArea;
