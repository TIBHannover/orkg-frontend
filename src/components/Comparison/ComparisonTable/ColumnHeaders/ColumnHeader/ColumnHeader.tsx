import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { faFile, faTags, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import useColumnWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useColumnWidth';
import { classToType } from '@/components/Comparison/ComparisonTable/Cell/Cell';
import useComparison from '@/components/Comparison/hooks/useComparison';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import {
    createDragDataFactory,
    createDragDataKey,
    createDragDataValidator,
    createDraggableItem,
    createEdgeChangeHandler,
    createInstanceId,
} from '@/components/shared/dnd/dragAndDropUtils';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';
import { ComparisonTableColumn } from '@/services/backend/types';

export const columnHeaderKey = createDragDataKey('columnHeader');
export const instanceId = createInstanceId('comparison-table-header');

export const createColumnHeaderData = createDragDataFactory(columnHeaderKey);
export const isColumnHeaderData = createDragDataValidator(columnHeaderKey);
export const isDragData = (data: Record<string | symbol, unknown>): data is { item: ComparisonTableColumn; index: number; instanceId: symbol } => {
    return data[columnHeaderKey] === true;
};

type HeaderTextProps = {
    link: string;
    column: ComparisonTableColumn;
};

const HeaderText = ({ link, column }: HeaderTextProps) => (
    <div>
        <Link href={link} className="tw:!text-white">
            <PaperTitle title={column.title.label} />
        </Link>
        <br />
        {column.subtitle ? (
            <small className="tw:italic tw:border-t tw:border-[rgb(215,80,80)] tw:mt-0.5 tw:pt-0.5 tw:block">{column.subtitle?.label}</small>
        ) : (
            <small className="tw:italic tw:border-t tw:border-[rgb(215,80,80)] tw:mt-0.5 tw:pt-0.5 tw:block">
                <FontAwesomeIcon icon={faTags} /> Instance of: {column.title.classes.join(', ')}
            </small>
        )}
    </div>
);

type ColumnHeaderProps = {
    column: ComparisonTableColumn;
    index: number;
    isLast?: boolean;
};

const ColumnHeader = ({ index, column, isLast }: ColumnHeaderProps) => {
    const [isOpenDataBrowserModal, setIsOpenDataBrowserModal] = useState(false);
    const { selectedPathsFlattened, comparison, mutateComparisonContents, comparisonContents, updateComparison, isEditMode } = useComparison();
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

    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || !isEditMode) {
            return undefined;
        }

        const onEdgeChange = createEdgeChangeHandler({
            targetElement: element,
            sourceIndex: index,
            targetIndex: index,
            setClosestEdge,
        });

        return createDraggableItem({
            element,
            item: column,
            index,
            instanceId,
            createDragData: createColumnHeaderData,
            isDragData: isColumnHeaderData,
            allowedEdges: ['left', 'right'],
            onDragStart: () => {
                setIsDragging(true);
                setClosestEdge(null);
            },
            onDrop: () => {
                setIsDragging(false);
                setClosestEdge(null);
            },
            onEdgeChange,
            onDragEnter: onEdgeChange,
            onDragLeave: () => setClosestEdge(null),
        });
    }, [column, index, isEditMode]);

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
            ref={ref}
            className={`tw:font-medium tw:p-0 th p-0 tw:w-[2px] tw:grow-[2] tw:shrink-0 tw:basis-auto tw:relative ${isDragging ? 'shadow' : ''}`}
        >
            <div className={`tw:h-full tw:bg-primary tw:px-2 tw:pt-1 tw:pb-2 tw:!text-white tw:relative ${isLast ? 'tw:rounded-tr-md' : ''}`}>
                <div className="tw:flex tw:flex-col tw:items-start tw:justify-between tw:h-full">
                    {columnWidth < 200 ? (
                        <Tooltip content={<HeaderText link={link} column={column} />}>
                            <Link href={link} className="tw:!text-white tw:flex tw:justify-center tw:items-center tw:h-full tw:w-full">
                                <FontAwesomeIcon icon={faFile} />
                            </Link>
                        </Tooltip>
                    ) : (
                        <HeaderText link={link} column={column} />
                    )}
                    {isEditMode && (
                        <Button color="primary-darker" size="sm" onClick={() => setIsOpenDataBrowserModal(true)}>
                            Edit data
                        </Button>
                    )}
                </div>
                {isEditMode && !isEmbeddedMode && (
                    <Button
                        onClick={handleDelete}
                        className="tw:absolute tw:top-[1px] tw:right-0 tw:!bg-[#ffa3a3] tw:hover:!bg-white tw:!border-0 tw:!text-primary tw:!w-[24px] tw:!h-[24px] tw:!p-0 tw:!rounded-full"
                    >
                        <FontAwesomeIcon icon={faTimes} className="" />
                    </Button>
                )}
            </div>

            <DataBrowserDialog
                show={isOpenDataBrowserModal}
                toggleModal={() => setIsOpenDataBrowserModal((v) => !v)}
                id={mainSource?.id}
                label={mainSource?.label}
                type={classToType[mainSource?._class ?? 'literal_ref']}
                comparisonSelectedPaths={selectedPathsFlattened.map((selectedPath) => [...(selectedPath.path ?? []), selectedPath.id])}
                isEditMode={isEditMode}
                defaultHistory={[mainSource?.id]}
                onCloseModal={() => isEditMode && mutateComparisonContents(comparisonContents, { revalidate: true })}
            />

            {closestEdge && isEditMode && <DropIndicator edge={closestEdge} />}
        </th>
    );
};

export default ColumnHeader;
