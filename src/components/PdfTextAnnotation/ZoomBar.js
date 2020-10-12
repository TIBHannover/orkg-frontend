import React from 'react';
import { ButtonGroup, Button } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { changeZoom } from 'actions/pdfTextAnnotation';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
    right: 105px;
    bottom: 20px;
    position: absolute;
    z-index: 5;
`;

const ZoomBar = () => {
    const dispatch = useDispatch();
    const zoom = useSelector(state => state.pdfTextAnnotation.zoom);

    const handleZoomIn = () => {
        dispatch(changeZoom(zoom * 1.2));
    };
    const handleZoomOut = () => {
        dispatch(changeZoom(zoom * 0.8));
    };

    return (
        <Container>
            <ButtonGroup className="rounded-pill">
                <Button color="darkblue" onClick={handleZoomIn} size="lg">
                    <Icon icon={faSearchPlus} />
                </Button>
                <Button color="darkblue" onClick={handleZoomOut} size="lg">
                    <Icon icon={faSearchMinus} />
                </Button>
            </ButtonGroup>
        </Container>
    );
};

ZoomBar.propTypes = {};

export default ZoomBar;
