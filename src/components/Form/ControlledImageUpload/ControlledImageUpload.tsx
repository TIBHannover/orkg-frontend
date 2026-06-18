import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label } from '@heroui/react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { FieldValues, useController } from 'react-hook-form';

import { ControlledFieldProps } from '@/components/Form/types';

type ControlledImageUploadProps<T extends FieldValues> = ControlledFieldProps<T> & {
    accept?: string;
    uploadLabel?: string;
    changeLabel?: string;
    alt?: string;
};

/**
 * Image upload field that stores the selected `File` directly as the form value
 * (the value type should be `File | string`, where a `string` is an existing
 * remote URL). This keeps the binary inside react-hook-form so dirty-state and
 * validation work without any external refs.
 */
const ControlledImageUpload = <T extends FieldValues>({
    control,
    name,
    label,
    isDisabled,
    className,
    accept = 'image/*',
    uploadLabel = 'Upload image',
    changeLabel = 'Change image',
    alt = 'Image preview',
}: ControlledImageUploadProps<T>) => {
    const { field, fieldState } = useController({ control, name });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const value = field.value as File | string | undefined;

    // Object URL preview of a newly selected file, kept in state. The cleanup effect revokes the
    // previous URL when it's replaced and the last one on unmount, so no blob leaks. (Requires the
    // img-src CSP to allow blob: — see next.config.js.)
    const [filePreview, setFilePreview] = useState('');
    const [fileName, setFileName] = useState('');

    useEffect(
        () => () => {
            if (filePreview.startsWith('blob:')) {
                URL.revokeObjectURL(filePreview);
            }
        },
        [filePreview],
    );

    // A freshly selected file wins; otherwise fall back to the existing remote (string) URL.
    const preview = filePreview || (typeof value === 'string' ? value : '');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            field.onChange(file);
            setFileName(file.name);
            setFilePreview(URL.createObjectURL(file));
        }
        // Reset so selecting the same file again still fires onChange.
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className ?? ''}`}>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-3">
                {preview && (
                    <div className="size-20 rounded-[var(--radius)] border border-border bg-default/30 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} className="max-w-full max-h-full object-contain" alt={alt} />
                    </div>
                )}
                <div className="flex flex-col gap-1">
                    <Button variant="secondary" size="sm" isDisabled={isDisabled} onPress={() => fileInputRef.current?.click()} onBlur={field.onBlur}>
                        <FontAwesomeIcon icon={faUpload} className="me-2" />
                        {preview ? changeLabel : uploadLabel}
                    </Button>
                    {fileName && <span className="text-xs text-muted truncate max-w-[14rem]">{fileName}</span>}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    aria-label={label ?? uploadLabel}
                    disabled={isDisabled}
                    onChange={handleChange}
                    className="sr-only"
                />
            </div>
            {fieldState.error && <span className="text-sm text-danger">{fieldState.error.message}</span>}
        </div>
    );
};

export default ControlledImageUpload;
