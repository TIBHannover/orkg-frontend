import styled, { createGlobalStyle } from 'styled-components';
import { Button } from 'reactstrap';

export const AuthorTags = styled.div`
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    flex-direction: column;
    position: relative;
    overflow: hidden;
`;

export const AddAuthor = styled(Button)`
    margin: 0 0 2px 0;
    &:hover {
        background-color: #e9ecef;
        color: ${props => props.theme.secondaryDarker};
    }
`;

export const StyledDragHandle = styled.div`
    padding: 8px 10px;
    cursor: move;
`;

export const AuthorTag = styled.div`
    background-color: #e9ecef;
    display: flex;
    margin: 0 0 4px 0;
    box-sizing: border-box;
    color: rgb(147, 147, 147);
    cursor: pointer;
    border-radius: 12px;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    &:hover {
        background-color: #ffbdad;
        color: #de350b;
    }

    .name {
        padding: 8px 10px;
        color: #495057;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        flex: 1;
        display: flex;
    }

    .delete {
        padding: 8px 10px;
        align-items: center;
        display: inline-block;
        box-sizing: border-box;
        margin-left: 2px;
        cursor: pointer;
    }

    .delete:hover {
        background-color: #e9ecef;
        color: #de350b;
    }
`;

export const GlobalStyle = createGlobalStyle`
    .sortable-helper{
        z-index: 10000 !important;
    }
`;
