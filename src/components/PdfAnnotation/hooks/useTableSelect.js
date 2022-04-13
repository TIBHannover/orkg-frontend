import { useState, useCallback } from 'react';
import { addTableRegion, deleteTableRegion } from 'slices/pdfAnnotationSlice';
import { useSelector, useDispatch } from 'react-redux';

function useTableSelect(props) {
    const [isDragging, setIsDragging] = useState(false);
    const selectedTool = useSelector(state => state.pdfAnnotation.selectedTool);
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
    const [extractionModal, setExtractionModal] = useState({
        show: false,
        id: null,
        region: {}
    });
    const dispatch = useDispatch();

    const onMouseDown = useCallback(e => {
        setCoordinates({
            startX: e.nativeEvent.offsetX,
            startY: e.nativeEvent.offsetY
        });
        setIsDragging(true);
    }, []);

    const onMouseMove = useCallback(
        e => {
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
        },
        [coordinates, isDragging, selectedTool]
    );

    const onMouseUp = useCallback(
        e => {
            setIsDragging(false);

            // don't create a region if it is too small
            if (rect.w > 10 && rect.h > 10) {
                dispatch(addTableRegion({ region: rect, page: props.pageNumber }));
            }

            setRect({
                x: null,
                y: null,
                w: null,
                h: null
            });
        },
        [rect, props.pageNumber, dispatch]
    );

    const handleExtract = useCallback((e, id, region) => {
        e.stopPropagation(); // don't propagate to mouse down for dragging

        setExtractionModal({
            show: true,
            id,
            region
        });
    }, []);

    const toggleModel = useCallback(() => {
        setExtractionModal({
            ...extractionModal,
            show: false
        });
    }, [extractionModal]);

    // disable pointer events to ensure offsetX and offsetY on drag are from the page parent (and not other child elements)
    const pointerStyles = { pointerEvents: selectedTool === 'tableSelect' ? 'none' : 'auto' };

    const deleteRegion = useCallback(
        (e, id) => {
            e.stopPropagation();
            dispatch(deleteTableRegion(id));
        },
        [dispatch]
    );

    return [onMouseDown, onMouseUp, onMouseMove, pointerStyles, rect, handleExtract, deleteRegion, extractionModal, toggleModel];
}
export default useTableSelect;
