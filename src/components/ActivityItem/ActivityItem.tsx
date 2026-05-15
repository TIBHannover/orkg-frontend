import { cn } from '@heroui/react';
import { FC, ReactNode } from 'react';

type ActivityItemProps = {
    isLast?: boolean;
    className?: string;
    children: ReactNode;
};

const ActivityItem: FC<ActivityItemProps> = ({ isLast = false, className, children }) => (
    <div className={cn('relative flex gap-4', className)}>
        <div className="flex flex-col items-center shrink-0">
            <div className="size-3 rounded-full bg-default mt-[5px] shrink-0" />
            {!isLast && <div className="w-[3px] grow bg-border mt-1.5" />}
        </div>
        <div className="pb-5 min-w-0 flex-1">{children}</div>
    </div>
);

export default ActivityItem;
