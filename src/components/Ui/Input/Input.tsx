import { cn, Input as HeroUIInput } from '@heroui/react';
import { forwardRef, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    type?: string;
    bsSize?: 'xs' | 'sm' | 'lg' | string;
    size?: number;
    invalid?: boolean;
    valid?: boolean;
    innerRef?: Ref<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
    plaintext?: boolean;
    addon?: boolean;
    tag?: React.ElementType;
    label?: string;
    inline?: boolean;
    children?: ReactNode;
    rows?: number | string;
};

const SIZE_CLASSES: Record<string, string> = {
    xs: 'py-0.5 px-1.5 text-xs',
    sm: 'py-1 px-2 text-sm',
    lg: 'py-2.5 px-3 text-base',
};

const Input = forwardRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, InputProps>(
    (
        {
            type = 'text',
            bsSize,
            invalid,
            valid: _valid,
            innerRef,
            plaintext: _plaintext,
            addon: _addon,
            tag: _tag,
            label: _label,
            inline: _inline,
            className,
            children,
            rows,
            size,
            ...rest
        },
        ref,
    ) => {
        const resolvedRef = innerRef ?? ref;
        const sizeClass = bsSize ? (SIZE_CLASSES[bsSize] ?? '') : '';

        if (type === 'select') {
            return (
                <select
                    ref={resolvedRef as Ref<HTMLSelectElement>}
                    className={cn('input', 'input--full-width', sizeClass, invalid && 'border-danger', className)}
                    size={size}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...(rest as any)}
                >
                    {children}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    fullWidth
                    ref={resolvedRef as Ref<HTMLTextAreaElement>}
                    className={cn('input', 'input--full-width', sizeClass, invalid && 'border-danger', className)}
                    rows={typeof rows === 'string' ? parseInt(rows, 10) : rows}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    {...(rest as any)}
                />
            );
        }

        if (type === 'checkbox' || type === 'radio') {
            return <input ref={resolvedRef as Ref<HTMLInputElement>} type={type} className={cn('form-check-input', className)} {...rest} />;
        }

        if (type === 'switch') {
            return (
                <input
                    ref={resolvedRef as Ref<HTMLInputElement>}
                    type="checkbox"
                    role="switch"
                    className={cn('form-check-input', className)}
                    {...rest}
                />
            );
        }

        return (
            <HeroUIInput
                fullWidth
                ref={resolvedRef as Ref<HTMLInputElement>}
                type={type}
                className={cn(sizeClass, className)}
                data-invalid={invalid || undefined}
                size={size}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(rest as any)}
            />
        );
    },
);

Input.displayName = 'Input';
export default Input;
