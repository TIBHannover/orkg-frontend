import { faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup } from '@heroui/react';
import { useDispatch, useSelector } from 'react-redux';

import { changeZoom } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';

const ZoomBar = () => {
    const dispatch = useDispatch();
    const scale = useSelector((state: RootStore) => state.pdfAnnotation.scale);

    const handleZoomIn = () => {
        dispatch(changeZoom(scale * 1.2));
    };
    const handleZoomOut = () => {
        dispatch(changeZoom(scale * 0.8));
    };

    return (
        <div className="absolute right-[105px] bottom-5 z-[5]">
            <ButtonGroup className="rounded-full">
                <Button className="button--orkg-secondary" onPress={handleZoomIn} size="lg" aria-label="Zoom in">
                    <FontAwesomeIcon icon={faSearchPlus} />
                </Button>
                <Button className="button--orkg-secondary" onPress={handleZoomOut} size="lg" aria-label="Zoom out">
                    <FontAwesomeIcon icon={faSearchMinus} />
                </Button>
            </ButtonGroup>
        </div>
    );
};

export default ZoomBar;
