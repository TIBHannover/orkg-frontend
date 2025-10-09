import { FC } from 'react';
import Skeleton from 'react-loading-skeleton';

import Badge from '@/components/Ui/Badge/Badge';
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

                <Badge color="light" pill className="ms-1 px-2">
                    {isLoading && <Skeleton width={10} />}
                    {!isLoading && count[paperSection]?.toLocaleString('en-US', { notation: 'compact' })}
                </Badge>
            </span>
        </div>
    );
};
export default TabLabel;
