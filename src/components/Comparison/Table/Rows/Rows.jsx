import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Scrollbar } from 'react-scrollbars-custom';

import { activatedPropertiesToList } from '@/components/Comparison/hooks/helpers';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Row, { isRowData } from '@/components/Comparison/Table/Rows/Row';
import { createInstanceId, createListMonitor, performReorder } from '@/components/shared/dnd/dragAndDropUtils';
import { updateContributionOrder, updatePropertyOrder } from '@/slices/comparisonSlice';

const Rows = ({ rows, scrollContainerBody, getTableBodyProps, prepareRow }) => {
    const { comparison, updateComparison } = useComparison();
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const properties = useSelector((state) => state.comparison.properties);
    const predicates = activatedPropertiesToList(properties);
    const dispatch = useDispatch();
    const [instanceId] = useState(() => createInstanceId('comparison-rows'));

    const reorder = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }) => {
            if (!comparison?.config) {
                return;
            }

            const finishIndex = getReorderDestinationIndex({
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (finishIndex === startIndex) {
                return;
            }

            if (!transpose) {
                const newPredicates = performReorder({
                    items: comparison.config.predicates.length > 0 ? comparison.config.predicates : predicates,
                    startIndex,
                    indexOfTarget,
                    closestEdgeOfTarget,
                });
                dispatch(updatePropertyOrder({ from: startIndex, to: finishIndex }));
                updateComparison({
                    config: {
                        ...comparison.config,
                        predicates: newPredicates,
                    },
                });
            } else {
                dispatch(updateContributionOrder({ from: startIndex, to: finishIndex }));
                updateComparison({
                    config: {
                        ...comparison.config,
                        contributions: performReorder({ items: comparison.config.contributions, startIndex, indexOfTarget, closestEdgeOfTarget }),
                    },
                });
            }
        },
        [transpose, dispatch, updateComparison, comparison?.config],
    );

    useEffect(() => {
        return createListMonitor({
            instanceId,
            items: rows,
            isDragData: isRowData,
            onReorder: reorder,
            getItemId: (item) => item.id,
        });
    }, [instanceId, rows, reorder]);

    return (
        <Scrollbar
            style={{ width: '100%' }}
            translateContentSizeYToHolder
            noScrollY
            wrapperProps={{
                renderer: ({ elementRef, key, ...restProps }) => <div key={key} {...restProps} ref={elementRef} className="position-static" />,
            }}
            scrollerProps={{
                renderer: ({ elementRef, key, ...restProps }) => (
                    <div
                        key={key}
                        {...restProps}
                        ref={(el) => {
                            elementRef(el);
                            scrollContainerBody.current = el;
                        }}
                        className="position-static px-0"
                    />
                ),
            }}
            trackXProps={{
                renderer: ({ elementRef, key, ...restProps }) => (
                    <div key={key} {...restProps} ref={elementRef} className="position-sticky d-block w-100" />
                ),
            }}
            thumbXProps={{
                renderer: ({ elementRef, key, ...restProps }) => (
                    <div key={key} {...restProps} ref={elementRef} className="p-0" style={{ ...restProps.style, cursor: 'default' }} />
                ),
            }}
            contentProps={{
                renderer: ({ elementRef, key, ...restProps }) => <div key={key} {...restProps} ref={elementRef} className="d-block" />,
            }}
        >
            <div
                {...(() => {
                    const { key, ...bodyProps } = getTableBodyProps();
                    return bodyProps;
                })()}
            >
                {rows.map((row, index) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps();
                    return <Row row={row} index={index} key={`row-${index}-${row.id}`} instanceId={instanceId} {...rowProps} />;
                })}
            </div>
        </Scrollbar>
    );
};

Rows.propTypes = {
    scrollContainerBody: PropTypes.object.isRequired,
    rows: PropTypes.array.isRequired,
    getTableBodyProps: PropTypes.func.isRequired,
    prepareRow: PropTypes.func.isRequired,
};

export default Rows;
