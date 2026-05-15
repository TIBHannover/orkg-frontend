import { cn } from '@heroui/react';
import { type FC, type ReactNode } from 'react';

type BadgeTagProps = {
    children?: ReactNode;
    className?: string;
};

const BadgeTag: FC<BadgeTagProps> = ({ children, className }) => (
    <div className={cn('bg-default text-muted px-2 my-1 mr-1 min-h-[30px] rounded-[var(--radius)] text-[85%] flex items-center', className)}>
        {children}
    </div>
);

export default BadgeTag;
