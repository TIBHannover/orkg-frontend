import styled from 'styled-components';
import { CSSTransition } from 'react-transition-group';

export const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    font-size: small;
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.bodyColor};
    }
    a:active,
    a:focus {
        outline: 0;
        border: none;
        -moz-outline-style: none;
    }
    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;

export const ProvenanceBoxTabs = styled.div`
    .tab {
        margin-bottom: 0;
        padding: 10px;
        color: #666666;
        cursor: pointer;
        background-color: #d4d8e0;
        font-size: 12px;
        font-weight: bold;
        &.active,
        &:hover {
            background-color: #f8f9fb;
            color: #666666;
        }
    }
`;

export const ErrorMessage = styled.div`
    margin-bottom: 0;
    padding: 10px;
    color: #666666;
    cursor: pointer;
    background-color: #e0f2fc;
    border-color: #e0f2fc;
    font-size: 12px;
`;

export const SidebarStyledBox = styled.div`
    flex-grow: 1;
    overflow: hidden;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

export const AnimationContainer = styled(CSSTransition)`
    transition: 0.3s background-color, 0.3s border-color;

    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 0.5s opacity;
    }
`;

export const StyledItemProvenanceBox = styled.li`
    background-color: #f8f9fb;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 10px;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eeeff3;
    font-size: 12px;
    a {
        color: ${props => props.theme.bodyColor};
    }
    a:active,
    a:focus {
        outline: 0;
        border: none;
        -moz-outline-style: none;
    }
`;
