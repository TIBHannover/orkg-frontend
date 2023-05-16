import { useRef } from 'react';
import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import ItemTypes from 'constants/dndTypes';
import TemplateComponentValue from './Value/TemplateComponentValue';
import TemplateComponentProperty from './Property/TemplateComponentProperty';

function PropertyShape(props) {
    const editMode = useSelector(state => state.templateEditor.editMode);
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemTypes.PROPERTY_SHAPE,
        hover(item, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = props.id;
            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            // Determine mouse position
            const clientOffset = monitor.getClientOffset();
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }
            // Time to actually perform the action
            props.moveCard(dragIndex, hoverIndex);
            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.PROPERTY_SHAPE,
        item: { index: props.id },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => editMode,
    });
    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    return (
        <StatementsGroupStyle className="noTemplate list-group-item" style={{ opacity }}>
            <div ref={ref} className="row gx-0">
                <TemplateComponentProperty
                    handleDeletePropertyShape={props.handleDeletePropertyShape}
                    id={props.id}
                    property={props.property}
                    handlePropertiesSelect={props.handlePropertiesSelect}
                    dragRef={drag}
                />
                <TemplateComponentValue
                    id={props.id}
                    value={props.value}
                    minCount={props.minCount}
                    maxCount={props.maxCount}
                    minInclusive={props.minInclusive}
                    maxInclusive={props.maxInclusive}
                    pattern={props.pattern}
                    handleClassOfPropertySelect={props.handleClassOfPropertySelect}
                />
            </div>
        </StatementsGroupStyle>
    );
}

PropertyShape.propTypes = {
    id: PropTypes.number.isRequired,
    property: PropTypes.object.isRequired,
    value: PropTypes.object,
    minCount: PropTypes.string.isRequired,
    maxCount: PropTypes.string,
    minInclusive: PropTypes.string,
    maxInclusive: PropTypes.string,
    pattern: PropTypes.string,
    moveCard: PropTypes.func.isRequired,
    handleDeletePropertyShape: PropTypes.func.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default PropertyShape;
