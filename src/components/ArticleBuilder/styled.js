import { Button, Input } from 'reactstrap';
import styled from 'styled-components';

export const EditableTitle = styled(Input)`
    width: 100%;
    border: 0;
    background: inherit !important;
    font-size: inherit;
    padding: 0 5px;
    border-radius: ${props => props.theme.borderRadius};
    color: inherit;
    resize: none;
`;

export const MoveButton = styled.div`
    position: absolute;
    left: 0;
    width: 25px;
    top: 25px;
    display: none;
    &.hover {
        display: block;
    }
    &.down {
        top: calc(100% - 30px);
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
        background: ${props => props.theme.secondary};
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
    padding: 10px 40px 10px 40px !important;

    a {
        text-decoration: underline;
    }
`;

export const SectionTypeStyled = styled.button`
    background: #e9ebf2;
    border: 1px solid #c5cadb;
    border-radius: 3px;
    position: absolute;
    right: -6px;
    top: -6px;
    color: ${props => props.theme.secondary};
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

export const MarkdownPlaceholder = styled.span`
    color: #aaa;
`;
