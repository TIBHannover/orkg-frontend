import { cn } from '@heroui/react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

type InputGroupProps = HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg' | string;
    tag?: React.ElementType;
    children?: ReactNode;
};

const SIZE_CLASSES: Record<string, string> = {
    sm: 'input-group-sm',
    lg: 'input-group-lg',
};

const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(({ size, tag: _tag, className, children, ...rest }, ref) => {
    const sizeClass = size ? (SIZE_CLASSES[size] ?? '') : '';

    return (
        <div ref={ref} className={cn('input-group', sizeClass, className)} {...rest}>
            {children}
        </div>
    );
});

InputGroup.displayName = 'InputGroup';
export default InputGroup;
