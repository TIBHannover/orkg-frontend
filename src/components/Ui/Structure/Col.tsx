import { FC, HTMLAttributes } from 'react';
import { cn } from 'tailwind-variants';

interface ColProps extends HTMLAttributes<HTMLDivElement> {
    xs?: string | number | boolean;
    sm?: string | number | boolean;
    md?: string | number | boolean;
    lg?: string | number | boolean;
    xl?: string | number | boolean;
}

const Col: FC<ColProps> = ({ children, className, xs, sm, md, lg, xl, ...rest }) => {
    // Build CSS classes based on breakpoint props
    const getColClasses = () => {
        const classes: string[] = ['px-2 min-w-0']; // Default padding + prevent flex overflow

        // Base size (xs or default)
        if (xs && typeof xs !== 'boolean') {
            classes.push(`col-${xs}`);
        } else if (xs === true) {
            classes.push('flex-1');
        } else if (!xs && (sm || md || lg || xl)) {
            // Default to full width on mobile when only larger breakpoints are specified
            classes.push('w-full');
        }

        // Responsive breakpoints
        if (sm && typeof sm !== 'boolean') {
            classes.push(`sm-col-${sm}`);
        }

        if (md && typeof md !== 'boolean') {
            classes.push(`md-col-${md}`);
        }

        if (lg && typeof lg !== 'boolean') {
            classes.push(`lg-col-${lg}`);
        }

        if (xl && typeof xl !== 'boolean') {
            classes.push(`xl-col-${xl}`);
        }

        return classes;
    };

    const colClasses = cn(...getColClasses(), className);

    return (
        <div className={colClasses} {...rest}>
            {children}
        </div>
    );
};

export { Col };
export default Col;
