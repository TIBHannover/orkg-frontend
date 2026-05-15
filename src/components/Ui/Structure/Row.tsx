import { FC, HTMLAttributes } from 'react';
import { cn } from 'tailwind-variants';

interface RowProps extends HTMLAttributes<HTMLDivElement> {
    noGutters?: boolean;
}

const Row: FC<RowProps> = ({ children, className, noGutters = false, ...rest }) => {
    const rowClasses = cn(
        'flex flex-wrap w-full',
        {
            '-mx-2': !noGutters,
            'mx-0': noGutters,
        },
        className,
    );

    return (
        <div className={rowClasses} {...rest}>
            {children}
        </div>
    );
};

export { Row };
export default Row;
