import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'motion/react';
import { FC } from 'react';

import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { ComparisonTableColumn } from '@/services/backend/types';

type ShowMoreButtonProps = {
    hiddenCount: number;
    isExpanded: boolean;
    path: string[];
    propertyLabel: string;
    columns: ComparisonTableColumn[];
    columnWidth: number;
    onToggle: () => void;
};

const ShowMoreButton: FC<ShowMoreButtonProps> = ({ hiddenCount, isExpanded, path, propertyLabel, columns, columnWidth, onToggle }) => {
    const bgColor = getBackgroundColor(path?.length ? path.length - 1 : 0);

    const showMoreText = isExpanded
        ? `Show less ${propertyLabel}`
        : `Show ${hiddenCount} more (${propertyLabel}) ${hiddenCount === 1 ? 'value' : 'values'}`;

    return (
        <motion.tr
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            onClick={() => onToggle()}
            className="tw:p-0 tw:flex tw:items-stretch tw:flex-grow tw:min-w-fit tw:cursor-pointer tw:group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggle();
                }
            }}
            aria-label={showMoreText}
        >
            <th
                className="tw:!sticky tw:left-0 tw:!border-[#e7eaf1] tw:!border-b tw:!border-r tw:!border-l tw:flex tw:z-10 tw:min-w-[250px] tw:w-[2px] tw:grow-[2] tw:shrink-0 tw:basis-auto tw:group-hover:!bg-[#e9ebf2] tw:transition-colors tw:duration-150"
                scope="row"
                style={{ background: bgColor }}
            >
                <HierarchyIndicator path={path?.slice(1) ?? []} side="left" showHorizontalLine={false} />
                <div className="tw:flex tw:flex-row tw:items-start tw:py-1 tw:px-2 tw:w-full">
                    <div className="tw:flex tw:items-start tw:gap-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:group-hover:text-primary tw:transition-colors tw:duration-150">
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="tw:shrink-0 tw:mt-0.5"
                        >
                            <FontAwesomeIcon icon={faChevronDown} className="tw:w-3 tw:h-3" />
                        </motion.div>
                        <span>{showMoreText}</span>
                    </div>
                </div>
            </th>
            {columns.map((column) => {
                const columnId = column?.subtitle?.id ?? column?.title.id ?? 'col';
                return (
                    <td
                        key={`show-more-${path.join('-')}-${columnId}`}
                        style={{ minWidth: `${columnWidth}px`, background: bgColor }}
                        className="tw:p-0 tw:w-[2px] tw:grow-[2] tw:shrink-0 tw:basis-auto tw:!border-[#e7eaf1] tw:!border-b tw:group-hover:!bg-[#e9ebf2] tw:transition-colors tw:duration-150"
                        aria-hidden="true"
                    />
                );
            })}
        </motion.tr>
    );
};

export default ShowMoreButton;
