import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { functions, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Row = ({ row, index }) => {
    const { isEditMode } = useIsEditMode();

    return (
        <Draggable draggableId={row.id} key={row.getRowProps().key} index={index} isDragDisabled={!isEditMode}>
            {(providedDraggable) => (
                <div
                    className="comparisonRow tr p-0"
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    style={{
                        ...row.getRowProps()?.style,
                        ...providedDraggable.draggableProps?.style,
                    }}
                >
                    {row.cells.map((cell, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <div {...cell.getCellProps()} className="td p-0" {...(index === 0 ? providedDraggable.dragHandleProps : {})}>
                            {cell.render('Cell')}
                        </div>
                    ))}
                </div>
            )}
        </Draggable>
    );
};

Row.propTypes = {
    row: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
};

export default memo(Row, (prevProps, nextProps) =>
    isEqual(omit(prevProps.row.cells, functions(prevProps.row.cells)), omit(nextProps.row.cells, functions(nextProps.row.cells))),
);
