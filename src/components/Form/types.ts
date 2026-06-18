import { Control, FieldPath, FieldValues } from 'react-hook-form';

/**
 * Base props shared by every react-hook-form-bound field component.
 * Generic over the form's value type so `name` is type-checked against the schema.
 */
export type ControlledFieldProps<T extends FieldValues> = {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    description?: string;
    isDisabled?: boolean;
    isRequired?: boolean;
    className?: string;
};
