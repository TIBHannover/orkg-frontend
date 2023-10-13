import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import arrayMove from 'array-move';
import { ValueItemStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DND_TYPES from 'constants/dndTypes';
import { updateList } from 'services/backend/lists';
import { checkIfIsList, updateOrderValues } from 'slices/statementBrowserSlice';
import { handleSortableHoverReactDnd } from 'utils';

const SortableValueItem = ({ id, propertyId, index, enableEdit, children }) => {
    const ref = useRef(null);
    const dispatch = useDispatch();
    const valueIds = useSelector(state => state.statementBrowser.properties.byId[propertyId].valueIds);
    const originalIndex = valueIds.indexOf(id);
    const values = useSelector(state => state.statementBrowser.values);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);

    const handleUpdate = ({ dragIndex, hoverIndex }) => {
        const _valueIds = arrayMove(valueIds, dragIndex, hoverIndex);
        dispatch(updateOrderValues({ propertyId, valueIds: _valueIds }));
    };

    const [, drop] = useDrop({
        accept: DND_TYPES.LIST_ITEM,
        hover: (item, monitor) => handleSortableHoverReactDnd({ item, monitor, currentRef: ref.current, hoverIndex: index, handleUpdate }),
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: DND_TYPES.LIST_ITEM,
        item: { index, originalIndex },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => enableEdit,
        end: item => {
            if (item.index !== item.originalIndex) {
                updateList({ id: selectedResource, elements: valueIds.map(_id => values.byId[_id].resourceId) });
                toast.dismiss();
                toast.success('Order updated successfully');
            }
        },
    });

    const opacity = isDragging ? 0 : 1;

    preview(drop(ref));

    const isList = useSelector(state => checkIfIsList({ state, propertyId }));

    return (
        <ValueItemStyle ref={ref} className="d-flex align-items-center" style={{ opacity }}>
            {isList && enableEdit && (
                <div className="px-2" ref={drag} style={{ cursor: 'move' }}>
                    <Icon icon={faGripVertical} className="text-secondary" />
                </div>
            )}
            {children}
        </ValueItemStyle>
    );
};

SortableValueItem.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    children: PropTypes.node.isRequired,
};

export default SortableValueItem;
