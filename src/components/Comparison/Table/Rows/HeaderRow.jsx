import PropTypes from 'prop-types';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import useComparison from '@/components/Comparison/hooks/useComparison';
import { isColumnHeaderData } from '@/components/Comparison/Table/Cells/ColumnHeader/ColumnHeader';
import { createInstanceId, createListMonitor, performReorder } from '@/components/shared/dnd/dragAndDropUtils';
import { updateContributionOrder, updatePropertyOrder } from '@/slices/comparisonSlice';

const HeaderRow = ({ scrollContainerHead, headerGroups }) => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const contributions = useSelector((state) => state.comparison.contributions);
    const properties = useSelector((state) => state.comparison.properties);
    const data = useSelector((state) => state.comparison.data);
    const { comparison, updateComparison } = useComparison();
    const dispatch = useDispatch();
    const [instanceId] = useState(() => createInstanceId('comparison-table-header'));

    // Get the items being dragged (either contributions or properties)
    const items = transpose ? properties.filter((property) => property.active && data[property.id]) : contributions;

    const reorderItems = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }) => {
            if (!transpose) {
                const reorderedContributions = performReorder({
                    items: comparison.config.contributions,
                    startIndex,
                    indexOfTarget,
                    closestEdgeOfTarget,
                    axis: 'horizontal',
                });

                if (reorderedContributions !== comparison.config.contributions) {
                    dispatch(updateContributionOrder({ from: startIndex, to: indexOfTarget }));
                    updateComparison({
                        config: {
                            ...comparison.config,
                            contributions: reorderedContributions,
                        },
                    });
                }
            } else {
                const reorderedPredicates = performReorder({
                    items: comparison.config.predicates,
                    startIndex,
                    indexOfTarget,
                    closestEdgeOfTarget,
                    axis: 'horizontal',
                });

                if (reorderedPredicates !== comparison.config.predicates) {
                    dispatch(updatePropertyOrder({ from: startIndex, to: indexOfTarget }));
                    updateComparison({
                        config: {
                            ...comparison.config,
                            predicates: reorderedPredicates,
                        },
                    });
                }
            }
        },
        [transpose, comparison, dispatch, updateComparison],
    );

    useEffect(() => {
        const cleanup = createListMonitor({
            instanceId,
            items,
            isDragData: isColumnHeaderData,
            onReorder: reorderItems,
            getItemId: (item) => item.id,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, items, reorderItems]);

    return (
        <div ref={scrollContainerHead} style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }} className="disable-scrollbars">
            {headerGroups.map((headerGroup) => {
                const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                const { key: firstHeaderKey, ...firstHeaderProps } = headerGroup.headers[0].getHeaderProps();

                return (
                    <Fragment key={headerGroupKey}>
                        <div className="header" {...headerGroupProps}>
                            {/* The first cell in the table is not sortable */}
                            <div {...firstHeaderProps} className="th p-0">
                                {headerGroup.headers[0].render('Header')}
                            </div>
                            {headerGroup.headers.slice(1).map((column, index) => {
                                const { key: columnKey, ...columnProps } = column.getHeaderProps();
                                return (
                                    <Fragment key={columnKey}>
                                        {column.render('Header', {
                                            index,
                                            column,
                                            instanceId,
                                            totalColumns: headerGroup.headers.length - 1,
                                        })}
                                    </Fragment>
                                );
                            })}
                        </div>
                    </Fragment>
                );
            })}
        </div>
    );
};

HeaderRow.propTypes = {
    scrollContainerHead: PropTypes.object.isRequired,
    headerGroups: PropTypes.array.isRequired,
};

export default HeaderRow;
