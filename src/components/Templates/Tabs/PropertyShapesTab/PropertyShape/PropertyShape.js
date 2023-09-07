import { useRef } from 'react';
import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import ItemTypes from 'constants/dndTypes';
import { handleSortableHoverReactDnd } from 'utils';
import TemplateComponentValue from './Value/TemplateComponentValue';
import TemplateComponentProperty from './Property/TemplateComponentProperty';

function PropertyShape(props) {
    const editMode = useSelector(state => state.templateEditor.editMode);
    const ref = useRef(null);
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
