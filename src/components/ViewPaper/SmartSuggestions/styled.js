import { CSSTransition } from 'react-transition-group';
import { Button, ListGroupItem } from 'reactstrap';
import styled from 'styled-components';

export const AnimationContainer = styled(CSSTransition)`
    &.slide-left-enter {
        opacity: 0;
        transform: translateX(-100%);
        margin-bottom: -40px;
    }
    &.slide-left-enter-active {
        opacity: 1;
        transition: opacity 0.7s, transform 0.7s, margin-bottom 0.5s linear;
        transform: translateX(0%);
        margin-bottom: 0;
    }
    &.slide-left-exit {
        opacity: 1;
        transform: translateX(0%);
        margin-bottom: 0;
    }
    &.slide-left-exit-active {
        opacity: 0;
        transition: opacity 0.7s, transform 0.7s, margin-bottom 0.5s linear;
        transform: translateX(-100%);
        margin-bottom: -39px;
    }
`;

export const PropertyItem = styled(ListGroupItem)`
    background-color: ${props => props.theme.smart}!important;
    color: #fff !important;
    padding: 1rem 0.6rem;
    font-weight: 500;
`;

export const ValueItem = styled(ListGroupItem)`
    background-color: transparent !important;
    &:hover {
        background-color: #cee5e9 !important;
    }
`;

export const ShowMoreButton = styled(Button)`
    &:focus {
        outline: 0 !important;
        box-shadow: none;
    }
`;

export const SuggestionsBox = styled.div`
    padding: 12px 10px;
    background-color: #ecf6f8;
    border: 1px solid #c4e2e9;
`;
