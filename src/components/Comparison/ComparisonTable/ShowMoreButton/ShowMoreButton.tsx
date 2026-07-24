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
            className="p-0 flex items-stretch flex-grow min-w-fit cursor-pointer group"
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
                className="sticky left-0 border-border border-b border-r border-l flex z-10 min-w-[250px] w-[2px] grow-[2] shrink-0 basis-auto group-hover:bg-background transition-colors duration-150"
                scope="row"
                style={{ background: bgColor }}
            >
                <HierarchyIndicator path={path?.slice(1) ?? []} side="left" showHorizontalLine={false} />
                <div className="flex flex-row items-start py-1 px-2 w-full">
                    <div className="flex items-start gap-1.5 text-xs font-medium text-muted group-hover:text-accent transition-colors duration-150">
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="shrink-0 mt-0.5"
                        >
                            <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
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
                        className="p-0 w-[2px] grow-[2] shrink-0 basis-auto border-border border-b group-hover:bg-background transition-colors duration-150"
                        aria-hidden="true"
                    />
                );
            })}
        </motion.tr>
    );
};

export default ShowMoreButton;
