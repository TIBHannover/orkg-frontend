import { faSearchMinus, faSearchPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';

import { changeZoom } from '@/slices/pdfTextAnnotationSlice';

const Container = styled.div`
    right: 105px;
    bottom: 20px;
    position: absolute;
    z-index: 5;
`;

const ZoomBar = () => {
    const dispatch = useDispatch();
    const zoom = useSelector((state) => state.pdfTextAnnotation.zoom);

    const handleZoomIn = () => {
        dispatch(changeZoom(zoom * 1.2));
    };
    const handleZoomOut = () => {
        dispatch(changeZoom(zoom * 0.8));
    };

    return (
        <Container>
            <ButtonGroup className="rounded-pill">
                <Button color="secondary" onClick={handleZoomIn} size="lg">
                    <FontAwesomeIcon icon={faSearchPlus} />
                </Button>
                <Button color="secondary" onClick={handleZoomOut} size="lg">
                    <FontAwesomeIcon icon={faSearchMinus} />
                </Button>
            </ButtonGroup>
        </Container>
    );
};

ZoomBar.propTypes = {};

export default ZoomBar;
