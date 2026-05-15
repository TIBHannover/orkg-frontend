import { FC, HTMLAttributes } from 'react';
import { cn } from 'tailwind-variants';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
    fluid?: boolean;
}

const Container: FC<ContainerProps> = ({ children, className, fluid = false, ...rest }) => {
    const containerClasses = cn(
        'mx-auto px-3',
        {
            'w-full': fluid,
            'max-w-container': !fluid,
        },
        className,
    );

    return (
        <div className={containerClasses} {...rest}>
            {children}
        </div>
    );
};

export { Container };
export default Container;
