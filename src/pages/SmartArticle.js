import React, { useState, useEffect } from 'react';
import { Container, ButtonGroup, Button, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faBars, faCog, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Section from 'components/SmartArticle/Section';

const MoveHandle = styled.div`
    width: 25px;
    height: 100%;
    position: absolute;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
    color: grey;
    border-radius: 6px 0 0 6px;
    top: 0;
    z-index: 0;
    &.hover {
        background: ${props => props.theme.darkblue};
        color: #fff;
    }
`;

const DeleteButton = styled(Button)`
    position: absolute;
    top: -8px;
    left: -3px;
    z-index: 1;
    padding: 2px 8px !important;
    display: none !important;
    &.hover {
        display: block !important;
    }
`;

const SectionType = styled.button`
    background: #e9ebf2;
    border: 1px solid #c5cadb;
    border-radius: 3px;
    position: absolute;
    right: -6px;
    top: -6px;
    color: #5c6873;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 90%;
    padding: 1px 15px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);
`;

const SmartArticle = () => {
    useEffect(() => {
        document.title = 'Smart survey - ORKG';
    });

    const [isHovering, setIsHovering] = useState(true);

    return (
        <div>
            <Container>
                <div className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Smart article writer</h1>
                    <ButtonGroup className="flex-shrink-0">
                        <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                            <Icon icon={faDownload} />
                        </Button>
                        <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                            <Icon icon={faCog} />
                        </Button>
                        <Button className="flex-shrink-0" active color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                            <Icon icon={faTimes} /> Stop editing
                        </Button>
                    </ButtonGroup>
                </div>
            </Container>

            <Section />
            <Section />
        </div>
    );
};

export default SmartArticle;
