import Row from 'components/Comparison/Table/Rows/Row';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Scrollbar } from 'react-scrollbars-custom';
import { updateContributionOrder, updatePropertyOrder } from 'slices/comparisonSlice';

const Rows = ({ rows, scrollContainerBody, getTableBodyProps, prepareRow }) => {
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const dispatch = useDispatch();

    const handleDragEnd = ({ source, destination }) =>
        !transpose
            ? dispatch(updatePropertyOrder({ from: source?.index, to: destination?.index }))
            : dispatch(updateContributionOrder({ from: source?.index, to: destination?.index }));

    return (
        <Scrollbar
            style={{ width: '100%' }}
            translateContentSizeYToHolder
            noScrollY
            wrapperProps={{
                renderer: ({ elementRef, ...restProps }) => <div {...restProps} ref={elementRef} className="position-static" />,
            }}
            scrollerProps={{
                renderer: ({ elementRef, ...restProps }) => (
                    <div
                        {...restProps}
                        ref={el => {
                            elementRef(el);
                            scrollContainerBody.current = el;
                        }}
                        className="position-static px-0"
                    />
                ),
            }}
            trackXProps={{
                renderer: ({ elementRef, ...restProps }) => <div {...restProps} ref={elementRef} className="position-sticky d-block w-100" />,
            }}
            thumbXProps={{
                renderer: ({ elementRef, ...restProps }) => (
                    <div {...restProps} ref={elementRef} className="p-0" style={{ ...restProps.style, cursor: 'default' }} />
                ),
            }}
            contentProps={{
                renderer: ({ elementRef, ...restProps }) => <div {...restProps} ref={elementRef} className="d-block" />,
            }}
        >
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable
                    droppableId="droppable-rows"
                    direction="vertical"
                    renderClone={(provided, snapshot, rubric) => (
                        <div
                            className={`tr p-0 ${snapshot.isDragging ? 'shadow' : ''}`}
                            {...provided.draggableProps}
                            {...rows[rubric.source.index].cells[0].getCellProps()}
                            style={{
                                ...rows[rubric.source.index].cells[0].getCellProps()?.style,
                                ...provided.draggableProps?.style,
                                width: 250,
                            }}
                            ref={provided.innerRef}
                        >
                            {rows[rubric.source.index].cells[0].render('Cell')}
                        </div>
                    )}
                >
                    {providedDroppable => (
                        <div ref={providedDroppable.innerRef} {...getTableBodyProps()} {...providedDroppable.droppableProps}>
                            {rows.map((row, index) => {
                                prepareRow(row);
                                return <Row row={row} index={index} key={row.getRowProps().key} />;
                            })}

                            {providedDroppable.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
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
