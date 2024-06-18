import { OptionType } from 'components/Autocomplete/types';
import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import TemplateComponentProperty from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/Property/TemplateComponentProperty';
import TemplateComponentValue from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/Value/TemplateComponentValue';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ItemTypes from 'constants/dndTypes';
import { FC, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ActionMeta, SingleValue } from 'react-select';
import { handleSortableHoverReactDnd } from 'utils';

type PropertyShapeProps = {
    id: number;
    moveCard: (_dragIndex: number, _hoverIndex: number) => void;
    handleDeletePropertyShape: (_index: number) => void;
    handlePropertiesSelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
    handleClassOfPropertySelect: (_selected: SingleValue<OptionType>, _action: ActionMeta<OptionType>, _index: number) => void;
};

const PropertyShape: FC<PropertyShapeProps> = ({ id, moveCard, handleDeletePropertyShape, handlePropertiesSelect, handleClassOfPropertySelect }) => {
    const ref = useRef(null);
    const { isEditMode } = useIsEditMode();

    const handleUpdate = ({ dragIndex, hoverIndex }: { dragIndex: number; hoverIndex: number }) => {
        moveCard(dragIndex, hoverIndex);
    };

    const [, drop] = useDrop({
        accept: ItemTypes.PROPERTY_SHAPE,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: id, handleUpdate }),
    });
    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.PROPERTY_SHAPE,
        item: { index: id },
        collect: (monitor) => ({
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
                    id={id}
                    handleDeletePropertyShape={handleDeletePropertyShape}
                    handlePropertiesSelect={handlePropertiesSelect}
                    dragRef={drag}
                />
                <TemplateComponentValue id={id} handleClassOfPropertySelect={handleClassOfPropertySelect} />
            </div>
        </StatementsGroupStyle>
    );
};

export default PropertyShape;
