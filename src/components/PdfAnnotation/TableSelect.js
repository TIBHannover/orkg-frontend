import React, { useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import ExtractionModal from './ExtractionModal';
import { useSelector, useDispatch } from 'react-redux';
import { addTableRegion, deleteTableRegion } from 'actions/pdfAnnotation';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    &.enable-table-select {
        // for pages
        cursor: crosshair; // set the cursor
        user-select: none; // disable text selection
        -webkit-touch-callout: none;

        // for images
        img {
            pointer-events: none;
        }
    }
`;

const SelectHelper = styled.div`
    position: absolute;
    background: #28afe975;
    border: 2px dashed #28afe9bd;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const RemoveButton = styled(Button)`
    position: absolute;
    right: -10px;
    top: -10px;
    pointer-events: all;
    border-radius: 100% !important;
    width: 25px;
    height: 25px;
`;

const TableSelect = props => {
    const [isDragging, setIsDragging] = useState(false);
    const [coordinates, setCoordinates] = useState({
        startX: -1,
        startY: -1
    });
    const [rect, setRect] = useState({
        x: null,
        y: null,
        w: null,
        h: null
    });
    const selectedTool = useSelector(state => state.pdfAnnotation.selectedTool);
    const tableRegions = useSelector(state => state.pdfAnnotation.tableRegions);
    const dispatch = useDispatch();
    const [extractionModal, setExtractionModal] = useState({
        show: false,
        id: null,
        region: {}
    });

    const onMouseDown = e => {
        setCoordinates({
            startX: e.nativeEvent.offsetX,
            startY: e.nativeEvent.offsetY
        });
        setIsDragging(true);
    };

    const onMouseMove = e => {
        if (!isDragging || selectedTool !== 'tableSelect') {
            return;
        }

        const event = e.nativeEvent;

        setRect({
            x: Math.min(coordinates.startX, event.offsetX),
            y: Math.min(coordinates.startY, event.offsetY),
            w: Math.abs(event.offsetX - coordinates.startX),
            h: Math.abs(event.offsetY - coordinates.startY)
        });
    };

    const onMouseUp = e => {
        setIsDragging(false);

        dispatch(addTableRegion({ region: rect, page: props.pageNumber }));

        setRect({
            x: null,
            y: null,
            w: null,
            h: null
        });
    };

    const handleExtract = (e, id, region) => {
        e.stopPropagation(); // don't propagate to mouse down for dragging
        //setShowExtractionModal(true);
        setExtractionModal({
            show: true,
            id,
            region
        });
    };

    const toggleModel = () => {
        setExtractionModal({
            ...extractionModal,
            show: false
        });
    };

    // disable pointer events to ensure offsetX and offsetY on drag are from the page parent (and not other child elements)
    const pointerStyles = { pointerEvents: selectedTool === 'tableSelect' ? 'none' : 'auto' };

    const deleteRegion = (e, id) => {
        e.stopPropagation();
        dispatch(deleteTableRegion(id));
    };

    return (
        <>
            <Container
                className={selectedTool === 'tableSelect' && 'enable-table-select'}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
            >
                <div style={pointerStyles}>
                    {props.children}

                    {rect && <SelectHelper style={{ top: rect.y, left: rect.x, width: rect.w, height: rect.h }} />}

                    {Object.keys(tableRegions)
                        .filter(key => tableRegions[key].page === props.pageNumber)
                        .map(key => {
                            const { region } = tableRegions[key];
                            return (
                                <SelectHelper style={{ top: region.y, left: region.x, width: region.w, height: region.h }} key={key}>
                                    <RemoveButton color="darkblueDarker" size="sm" className="p-0" onMouseDown={e => deleteRegion(e, key)}>
                                        <Icon icon={faTimes} />
                                    </RemoveButton>
                                    <Button
                                        style={{ pointerEvents: 'all' }}
                                        color="primary"
                                        size="sm"
                                        onMouseDown={e => handleExtract(e, key, region)}
                                    >
                                        Extract table
                                    </Button>
                                </SelectHelper>
                            );
                        })}
                </div>
            </Container>

            {extractionModal.show && (
                <ExtractionModal
                    isOpen={true}
                    toggle={toggleModel}
                    region={extractionModal.region}
                    id={extractionModal.id}
                    pageNumber={props.pageNumber}
                />
            )}
        </>
    );
};

TableSelect.propTypes = {
    children: PropTypes.node.isRequired,
    selectedTool: PropTypes.string,
    pageNumber: PropTypes.number.isRequired
};

export default TableSelect;
