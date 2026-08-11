import { Label } from '@heroui/react';
import { FieldValues, useController } from 'react-hook-form';

import AutocompleteContributor from '@/components/AutocompleteContributor/AutocompleteContributor';
import { ControlledFieldProps } from '@/components/Form/types';
import { Contributor } from '@/services/backend/types';

type ControlledAutocompleteContributorProps<T extends FieldValues> = ControlledFieldProps<T> & {
    placeholder?: string;
    /** Show the "open profile page" link next to the selected contributor. */
    showLink?: boolean;
    /** Put the signed-in user at the top of the default option list. */
    currentContributor?: boolean;
};

/**
 * Contributor autocomplete bound to react-hook-form. The form value is the full
 * `Contributor` object (or `null` when nothing is selected), so the schema decides
 * whether a selection is required.
 */
const ControlledAutocompleteContributor = <T extends FieldValues>({
    control,
    name,
    label,
    description,
    isDisabled,
    className,
    placeholder,
    showLink = true,
    currentContributor = true,
}: ControlledAutocompleteContributorProps<T>) => {
    const { field, fieldState } = useController({ control, name });
    const inputId = `select-contributor-${name}`;

    return (
        <div className={`flex flex-col gap-1 ${className ?? ''}`}>
            {label && <Label htmlFor={inputId}>{label}</Label>}
            <AutocompleteContributor
                inputId={inputId}
                contributor={(field.value as Contributor | null) ?? undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isInvalid={fieldState.invalid}
                showLink={showLink}
                currentContributor={currentContributor}
            />
            {fieldState.error ? (
                <span className="text-sm text-danger">{fieldState.error.message}</span>
            ) : (
                description && <span className="text-sm text-muted">{description}</span>
            )}
        </div>
    );
};

export default ControlledAutocompleteContributor;
