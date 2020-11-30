import styled from 'styled-components';
import { Container, Button } from 'reactstrap';
import ContentEditable from 'react-contenteditable';

export const ContentEditableStyled = styled(ContentEditable)`
    cursor: text; // force text cursor in case the element is empty
    padding: 2px;
    margin: -2px 0 0 -2px;
    &[contenteditable='true']:empty:before {
        content: attr(placeholder);
        display: block;
        color: #aaa;
    }
    &:focus {
        border-color: #f8d0d0;
        outline: 0;
        box-shadow: 0 0 0 0.22rem rgba(232, 97, 97, 0.25);
        border-radius: ${props => props.theme.borderRadius};
    }
`;

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

export const SectionStyled = styled.div`
    position: relative;
    padding: 10px 10px 10px 40px !important;
`;

export const SectionTypeStyled = styled.button`
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

export const SectionTypeContainerStyled = styled.div`
    min-width: 250px;
    border-radius: 6px;
    position: absolute;
    right: -6px;
    top: -6px;
    padding: 1px 1px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

    &:disabled {
        cursor: not-allowed;
    }
`;
