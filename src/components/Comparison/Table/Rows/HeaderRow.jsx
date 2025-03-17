import arrayMove from 'array-move';
import useComparison from 'components/Comparison/hooks/useComparison';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { updateContributionOrder, updatePropertyOrder } from 'slices/comparisonSlice';

const HeaderRow = ({ scrollContainerHead, headerGroups }) => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const { comparison, updateComparison } = useComparison();
    const dispatch = useDispatch();

    const handleDragEnd = ({ source, destination }) => {
        if (!transpose) {
            dispatch(updateContributionOrder({ from: source?.index, to: destination?.index }));
            updateComparison({
                config: {
                    ...comparison.config,
                    contributions: arrayMove(comparison.config.contributions, source?.index, destination?.index),
                },
            });
        } else {
            dispatch(updatePropertyOrder({ from: source?.index, to: destination?.index }));
            updateComparison({
                config: {
                    ...comparison.config,
                    predicates: arrayMove(comparison.config.predicates, source?.index, destination?.index),
                },
            });
        }
    };

    return (
        <div ref={scrollContainerHead} style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }} className="disable-scrollbars">
            {headerGroups.map((headerGroup) => (
                <Fragment key={headerGroup.getHeaderGroupProps().key}>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="droppable-columns" direction="horizontal">
                            {(providedDroppable) => (
                                <div
                                    ref={providedDroppable.innerRef}
                                    className="header"
                                    {...headerGroup.getHeaderGroupProps()}
                                    {...providedDroppable.droppableProps}
                                >
                                    {/* The first cell in the table is not sortable */}
                                    <div {...headerGroup.headers[0].getHeaderProps()} className="th p-0">
                                        {headerGroup.headers[0].render('Header')}
                                    </div>
                                    {headerGroup.headers.slice(1).map((column, index) => (
                                        <Fragment key={column.getHeaderProps().key}>{column.render('Header', { index, column })}</Fragment>
                                    ))}
                                    {providedDroppable.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Fragment>
            ))}
        </div>
    );
};

HeaderRow.propTypes = {
    scrollContainerHead: PropTypes.object.isRequired,
    headerGroups: PropTypes.array.isRequired,
};

export default HeaderRow;
