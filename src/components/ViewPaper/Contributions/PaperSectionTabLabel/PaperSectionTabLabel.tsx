import { Chip, Skeleton } from '@heroui/react';
import { FC } from 'react';

import usePaperSectionStats from '@/components/ViewPaper/Contributions/hooks/usePaperSectionStats';
import { PaperSections } from '@/services/backend/types';

type TabLabelProps = {
    label: string;
    paperId: string;
    paperSection: PaperSections;
};

const TabLabel: FC<TabLabelProps> = ({ label, paperId, paperSection }) => {
    const { count, isLoading } = usePaperSectionStats({ paperId });
    return (
        <div>
            <span className="cursor-pointer">
                {label}

                <Chip size="sm" color="accent" variant="soft" className="ml-1 px-2">
                    {isLoading && <Skeleton className="w-2.5 h-4 rounded" />}
                    {!isLoading && count[paperSection]?.toLocaleString('en-US', { notation: 'compact' })}
                </Chip>
            </span>
        </div>
    );
};
export default TabLabel;
