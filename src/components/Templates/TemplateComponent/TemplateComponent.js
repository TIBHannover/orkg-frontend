import { useRef } from 'react';
import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import TemplateComponentProperty from './Property/TemplateComponentProperty';
import TemplateComponentValue from './Value/TemplateComponentValue';
import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from 'constants/dndTypes';

function TemplateComponent(props) {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: ItemTypes.TEMPLATE_COMPONENT,
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
        }
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.TEMPLATE_COMPONENT,
        item: { index: props.id },
        collect: monitor => ({
            isDragging: monitor.isDragging()
        }),
        canDrag: () => props.enableEdit
    });
    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    return (
        <StatementsGroupStyle className="noTemplate list-group-item" style={{ opacity }}>
            <div ref={ref} className="row no-gutters">
                <TemplateComponentProperty
                    handleDeleteTemplateComponent={props.handleDeleteTemplateComponent}
                    id={props.id}
                    property={props.property}
                    enableEdit={props.enableEdit}
                    handlePropertiesSelect={props.handlePropertiesSelect}
                    dragRef={drag}
                />
                <TemplateComponentValue
                    id={props.id}
                    value={props.value}
                    minOccurs={props.minOccurs}
                    maxOccurs={props.maxOccurs}
                    enableEdit={props.enableEdit}
                    validationRules={props.validationRules}
                    handleClassOfPropertySelect={props.handleClassOfPropertySelect}
                />
            </div>
        </StatementsGroupStyle>
    );
}

TemplateComponent.propTypes = {
    id: PropTypes.number.isRequired,
    property: PropTypes.object.isRequired,
    value: PropTypes.object.isRequired,
    minOccurs: PropTypes.string.isRequired,
    maxOccurs: PropTypes.string,
    validationRules: PropTypes.object,
    moveCard: PropTypes.func.isRequired,
    handleDeleteTemplateComponent: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired
};

export default TemplateComponent;
