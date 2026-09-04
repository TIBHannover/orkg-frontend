import { faFile, faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { DropIndicator, useSortableItem } from '@orkg/pragmatic-dnd-hooks';
import Link from 'next/link';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { ComparisonTableColumn } from '@/services/backend/types';

type HeaderTextProps = {
    link: string;
    column: ComparisonTableColumn;
};

const HeaderText = ({ link, column }: HeaderTextProps) => (
    <div>
        <Link href={link} className="text-inherit">
            <PaperTitle title={column.title.label} />
        </Link>
        <br />
        {column.subtitle ? (
            <small className="italic border-t border-[rgb(215,80,80)] mt-0.5 pt-0.5 block">{column.subtitle?.label}</small>
        ) : (
            <small className="italic border-t border-[rgb(215,80,80)] mt-0.5 pt-0.5 block">
                <FontAwesomeIcon icon={faTags} /> Instance of: {column.title.classes.join(', ')}
            </small>
        )}
    </div>
);

type ColumnHeaderProps = {
    column: ComparisonTableColumn;
    index: number;
    instanceId: symbol;
    isLast?: boolean;
};

const ColumnHeader = ({ index, column, instanceId, isLast }: ColumnHeaderProps) => {
    const { comparison, mutateComparisonContents, comparisonContents, updateComparison, isEditMode } = useComparison();
    // This column's r=1 (parent-level) dialog is rendered by the shared
    // ComparisonDialogs controller from the URL entry — the header only
    // triggers it, without holding a URL subscription.
    const { openDialogEntry } = useComparisonState();
    const { columnWidth } = useColumnWidth();

    const mainSource = column.subtitle ?? column.title;

    const isEmbeddedMode = false;

    const handleDelete = async () => {
        if (!comparison) return;

        if (!confirm('Are you sure you want to remove this source from the comparison?')) {
            return;
        }

        await updateComparison({
            sources: comparison.sources.filter(({ id }) => id !== mainSource.id),
        });
        mutateComparisonContents(comparisonContents, { revalidate: true });
    };

    // no drag handle: the whole header cell drags (edit mode only); the axis is inferred from the list
    const { elementRef, isDragging, closestEdge } = useSortableItem({
        instanceId,
        index,
        isDisabled: !isEditMode,
    });

    const link = reverse(ROUTES.RESOURCE, {
        id: column.subtitle?.id ?? column.title.id,
    });

    return (
        <th
            style={{
                opacity: isDragging ? 0.4 : 1,
                cursor: isEditMode ? 'move' : 'default',
                minWidth: `${columnWidth}px`,
            }}
            ref={elementRef}
            className={`font-medium th p-0 w-[2px] grow-[2] shrink-0 basis-auto relative text-left ${isDragging ? 'shadow' : ''}`}
        >
            <div className={`h-full bg-accent px-2 pt-1 pb-2 text-white relative ${isLast ? 'rounded-tr-md' : ''}`}>
                <div className="flex flex-col items-start justify-between h-full">
                    {columnWidth < 200 ? (
                        <Tooltip content={<HeaderText link={link} column={column} />}>
                            <Link href={link} className="text-white flex justify-center items-center h-full w-full">
                                <FontAwesomeIcon icon={faFile} />
                            </Link>
                        </Tooltip>
                    ) : (
                        <HeaderText link={link} column={column} />
                    )}
                    {isEditMode && (
                        <Button
                            size="sm"
                            onPress={() => openDialogEntry([mainSource.id])}
                            className="bg-accent-darker text-white hover:bg-accent-darker/90"
                        >
                            Edit data
                        </Button>
                    )}
                </div>
                {isEditMode && !isEmbeddedMode && (
                    <Button
                        isIconOnly
                        size="sm"
                        onPress={handleDelete}
                        className="absolute top-[1px] right-0 bg-[#ffa3a3] hover:bg-white text-accent w-[24px] h-[24px] min-w-0 p-0 rounded-full"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </Button>
                )}
            </div>
            {closestEdge && isEditMode && (
                // the thead clips on both axes (overflow-x-scroll) and the first column is sticky at
                // z-20, so anything bleeding outside the cell is invisible at the table edges
                <DropIndicator edge={closestEdge} gap="0px" terminal="no-bleed" className="text-white" style={{ zIndex: 30 }} />
            )}
        </th>
    );
};

export default ColumnHeader;
