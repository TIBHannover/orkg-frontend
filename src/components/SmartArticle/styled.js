import styled from 'styled-components';
import { Container, Button } from 'reactstrap';

export const MoveHandle = styled.div`
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

export const DeleteButton = styled(Button)`
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

export const SectionStyled = styled(Container)`
    position: relative;
    padding: 10px 10px 10px 40px !important;
`;

export const SectionType = styled.button`
    background: #e9ebf2;
    border: 1px solid #c5cadb;
    border-radius: 3px;
    position: absolute;
    right: -6px;
    top: -6px;
    color: ${props => props.theme.darkblue};
    text-transform: uppercase;
    font-weight: bold;
    font-size: 90%;
    padding: 1px 15px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

    &:disabled {
        cursor: not-allowed;
    }
`;
