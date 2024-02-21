import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import TemplateComponentProperty from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/Property/TemplateComponentProperty';
import TemplateComponentValue from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/Value/TemplateComponentValue';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ItemTypes from 'constants/dndTypes';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { handleSortableHoverReactDnd } from 'utils';

function PropertyShape(props) {
    const ref = useRef(null);
    const { isEditMode } = useIsEditMode();
    const handleUpdate = ({ dragIndex, hoverIndex }) => {
        props.moveCard(dragIndex, hoverIndex);
    };
    const [, drop] = useDrop({
        accept: ItemTypes.PROPERTY_SHAPE,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: props.id, handleUpdate }),
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.PROPERTY_SHAPE,
        item: { index: props.id },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => isEditMode,
    });
    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    return (
        <StatementsGroupStyle className="noTemplate list-group-item" style={{ opacity }}>
            <div ref={ref} className="row gx-0">
                <TemplateComponentProperty
                    handleDeletePropertyShape={props.handleDeletePropertyShape}
                    id={props.id}
                    handlePropertiesSelect={props.handlePropertiesSelect}
                    dragRef={drag}
                />
                <TemplateComponentValue id={props.id} handleClassOfPropertySelect={props.handleClassOfPropertySelect} />
            </div>
        </StatementsGroupStyle>
    );
}

PropertyShape.propTypes = {
    id: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    moveCard: PropTypes.func.isRequired,
    handleDeletePropertyShape: PropTypes.func.isRequired,
    handlePropertiesSelect: PropTypes.func.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired,
};

export default PropertyShape;
