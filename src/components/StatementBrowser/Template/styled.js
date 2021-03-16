import { CSSTransition } from 'react-transition-group';
import { ListGroupItem } from 'reactstrap';
import styled from 'styled-components';

export const AddPropertyWrapper = styled(ListGroupItem)`
    border-top: 0 !important;
    padding: 0 !important;
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    & .propertyHolder {
        height: 20px;
        background-color: ${props => props.theme.ultraLightBlue};
    }
`;

export const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter,
    &.fadeIn-appear {
        overflow: hidden;
        transition: max-height 1s ease-out; // note that we're transitioning max-height, not height!
        height: auto;
        max-height: 0;
    }
    &.fadeIn-enter-active,
    &.fadeIn-appear-active {
        max-height: 1000px;
    }
`;
