import { Description, FieldError, Label, TextArea, TextField } from '@heroui/react';
import { ReactNode } from 'react';
import { FieldValues, useController } from 'react-hook-form';

import { ControlledFieldProps } from '@/components/Form/types';

type ControlledTextAreaProps<T extends FieldValues> = ControlledFieldProps<T> & {
    placeholder?: string;
    maxLength?: number;
    rows?: number;
    /** Rendered inside a `relative` wrapper around the textarea — for absolutely-positioned affordances pinned to its corner (e.g. a smart-suggestions trigger). */
    endContent?: ReactNode;
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
    endContent,
}: ControlledTextAreaProps<T>) => {
    const { field, fieldState } = useController({ control, name });

    const textArea = <TextArea placeholder={placeholder} maxLength={maxLength} rows={rows} />;

    return (
        <TextField {...field} fullWidth isInvalid={fieldState.invalid} isDisabled={isDisabled} isRequired={isRequired} className={className}>
            {label && <Label>{label}</Label>}
            {endContent ? (
                <div className="relative">
                    {textArea}
                    {endContent}
                </div>
            ) : (
                textArea
            )}
            {fieldState.error ? <FieldError>{fieldState.error.message}</FieldError> : description && <Description>{description}</Description>}
        </TextField>
    );
};

export default ControlledTextArea;
