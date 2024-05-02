import ContributionCell from 'components/Comparison/Table/Cells/ContributionCell';
import PropertyCell from 'components/Comparison/Table/Cells/PropertyCell';
import { ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { Draggable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';

const ColumnHeader = ({ headerData, columnId, columnStyle, property, index }) => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const isEditing = useSelector((state) => state.comparison.isEditing);

    return (
        <Draggable draggableId={columnId} index={index} isDragDisabled={!isEditing}>
            {(providedDraggable, snapshot) => (
                <div
                    className={`th p-0 ${snapshot.isDragging ? 'shadow' : ''}`}
                    ref={providedDraggable.innerRef}
                    {...providedDraggable.draggableProps}
                    {...providedDraggable.dragHandleProps}
                    style={{
                        ...columnStyle,
                        ...providedDraggable.draggableProps?.style,
                        ...providedDraggable.dragHandleProps?.style,
                    }}
                >
                    {!transpose ? (
                        <ItemHeader key={`contribution${headerData.id}`}>
                            <ItemHeaderInner>
                                <ContributionCell contribution={headerData} />
                            </ItemHeaderInner>
                        </ItemHeader>
                    ) : (
                        <ItemHeader key={`property${headerData.id}`}>
                            <ItemHeaderInner className="d-flex flex-row align-items-center justify-content-between" transpose={transpose}>
                                <PropertyCell
                                    similar={headerData.similar}
                                    label={headerData.label}
                                    id={headerData.id}
                                    group={headerData.group ?? false}
                                    grouped={headerData.grouped ?? false}
                                    property={property}
                                />
                            </ItemHeaderInner>
                        </ItemHeader>
                    )}
                </div>
            )}
        </Draggable>
    );
};

ColumnHeader.propTypes = {
    columnId: PropTypes.string.isRequired,
    columnStyle: PropTypes.object.isRequired,
    headerData: PropTypes.object.isRequired,
    property: PropTypes.object,
    index: PropTypes.number.isRequired,
};

export default ColumnHeader;
