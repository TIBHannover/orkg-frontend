import styled, { createGlobalStyle } from 'styled-components';
import { Button } from 'reactstrap';

export const GlobalStyle = createGlobalStyle`
    .rc-tabs-dropdown {
        position: absolute;
        background: #fefefe;
        border: 1px solid ${props => props.theme.lightDarker};
        max-height: 500px;
        overflow: auto;
        // dropdown
        scrollbar-width: thin;
        scrollbar-color: ${props => props.theme.secondary} ${props => props.theme.light};
        background: /* Shadow covers */ linear-gradient(white 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
            /* Shadows */ radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)),
            radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) 0 100%;
        background-repeat: no-repeat;
        background-color: white;
        background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
        /* Opera doesn't support this in the shorthand */
        background-attachment: local, local, scroll, scroll;
    }
    .rc-tabs-dropdown-hidden {
        display: none;
    }
    .rc-tabs-dropdown-menu {
        margin: 0;
        padding: 0;
        list-style: none;
    }
    .rc-tabs-dropdown-menu-item {
        padding: 7px 15px 7px 15px;
        cursor: pointer;
        border: 1px solid ${props => props.theme.light};
        button {
            color: inherit;
            outline: 0;
            background: inherit;
            border: 0;
            padding: 0;
            margin: 0;
            :hover {
                color: #fff !important;
            }
        }
    }
    .rc-tabs-dropdown-menu-item:hover {
        background: ${props => props.theme.primary};
        color: #fff;
        a {
            color: #fff !important;
        }
    }
    .rc-tabs-dropdown-menu-item-disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
`;

export const StyledContributionTabs = styled.div`
    .rc-tabs-content {
        display: flex;
        width: 100%;
    }
    .rc-tabs-content-holder {
        flex: auto;
    }
    .rc-tabs-content-animated {
        transition: margin 0.3s;
    }
    .rc-tabs-tabpane {
        width: 100%;
        flex: none;

        border-radius: ${props => props.theme.borderRadius};
        border-width: ${props => props.theme.borderWidth};
        border-color: ${props => props.theme.lightDarker};
        border-style: solid;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        padding: 10px 30px 25px;
    }
    .rc-tabs {
        display: flex;
    }
    .rc-tabs-top,
    .rc-tabs-bottom {
        flex-direction: column;
    }
    .rc-tabs-bottom .rc-tabs-nav {
        order: 1;
    }
    .rc-tabs-bottom .rc-tabs-content {
        order: 0;
    }
    .rc-tabs-left.rc-tabs-editable .rc-tabs-tab,
    .rc-tabs-right.rc-tabs-editable .rc-tabs-tab {
        padding-right: 32px;
    }
    .rc-tabs-left .rc-tabs-nav-wrap,
    .rc-tabs-right .rc-tabs-nav-wrap {
        flex-direction: column;
    }
    .rc-tabs-left .rc-tabs-nav,
    .rc-tabs-right .rc-tabs-nav {
        flex-direction: column;
        min-width: 50px;
    }
    .rc-tabs-left .rc-tabs-nav-list,
    .rc-tabs-right .rc-tabs-nav-list,
    .rc-tabs-left .rc-tabs-nav-operations,
    .rc-tabs-right .rc-tabs-nav-operations {
        flex: 1 0 auto;
        flex-direction: column;
    }
    .rc-tabs-right .rc-tabs-nav {
        order: 1;
    }
    .rc-tabs-right .rc-tabs-content {
        order: 0;
    }
    .rc-tabs-rtl {
        direction: rtl;
    }
    .rc-tabs-dropdown-rtl {
        direction: rtl;
    }
    .rc-tabs {
        //overflow: hidden;
    }
    .rc-tabs-nav {
        display: flex;
        flex: none;
        position: relative;
    }
    .rc-tabs-nav-measure,
    .rc-tabs-nav-wrap {
        transform: translate(0);
        position: relative;
        display: inline-block;
        flex: auto;
        white-space: nowrap;
        overflow: hidden;
        display: flex;
    }
    .rc-tabs-nav-measure-ping-left::before,
    .rc-tabs-nav-wrap-ping-left::before,
    .rc-tabs-nav-measure-ping-right::after,
    .rc-tabs-nav-wrap-ping-right::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
    }
    .rc-tabs-nav-measure-ping-left::before,
    .rc-tabs-nav-wrap-ping-left::before {
        left: 0;
        border-left: 1px solid ${props => props.theme.lightDarker};
        z-index: 2;
        box-shadow: inset 10px 0 8px -8px ${props => props.theme.lightDarker};
        position: absolute;
        opacity: 1;
        transition: opacity 0.5s;
        content: '';
        pointer-events: none;
        top: 0;
        bottom: 0;
        width: 30px;
    }
    .rc-tabs-nav-measure-ping-right::after,
    .rc-tabs-nav-wrap-ping-right::after {
        right: 0;
        border-right: 1px solid ${props => props.theme.lightDarker};
        box-shadow: inset -10px 0 8px -8px ${props => props.theme.lightDarker};
        position: absolute;
        opacity: 1;
        transition: opacity 0.5s;
        content: '';
        pointer-events: none;
        top: 0;
        bottom: 0;
        width: 30px;
    }
    .rc-tabs-nav-measure-ping-top::before,
    .rc-tabs-nav-wrap-ping-top::before,
    .rc-tabs-nav-measure-ping-bottom::after,
    .rc-tabs-nav-wrap-ping-bottom::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
    }
    .rc-tabs-nav-measure-ping-top::before,
    .rc-tabs-nav-wrap-ping-top::before {
        top: 0;
    }
    .rc-tabs-nav-measure-ping-bottom::after,
    .rc-tabs-nav-wrap-ping-bottom::after {
        bottom: 0;
    }
    .rc-tabs-nav-list {
        display: flex;
        position: relative;
        transition: transform 0.3s;
    }
    .rc-tabs-nav-operations {
        display: flex;
    }
    .rc-tabs-nav-operations-hidden {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
    }
    .rc-tabs-nav-more {
        border: 1px solid ${props => props.theme.lightDarker};
        border-bottom: 0;
        background-color: ${props => props.theme.lightLighter};
        border-top-right-radius: ${props => props.theme.borderRadius};
        padding: 0 12px;
        color: #5c6873;
    }
    .rc-tabs-nav-more:hover {
        background: ${props => props.theme.primary};
        color: #fff;
        border-color: ${props => props.theme.primary};
    }
    .rc-tabs-nav-add {
        border: 1px solid green;
        background: rgba(0, 255, 0, 0.1);
    }
    .rc-tabs-tab {
        border: 1px solid ${props => props.theme.lightDarker};
        border-bottom: 0;
        background-color: ${props => props.theme.lightLighter};
        box-sizing: border-box;
        padding: 7px 15px 7px 15px;
        display: flex;
        transition: 0.1s background;
        color: inherit;
        outline: 0;
        cursor: pointer;
        position: relative;
        button {
            color: inherit;
            outline: 0;
            background: inherit;
            border: 0;
            padding: 0;
            margin: 0;
            :hover {
                color: #fff !important;
            }
        }
    }
    .rc-tabs-tab:hover {
        background: ${props => props.theme.primary};
        color: #fff !important;
        border-color: ${props => props.theme.primary};
        a {
            color: #fff !important;
        }
    }
    // first item has border radius left
    .rc-tabs-tab:first-child {
        border-top-left-radius: ${props => props.theme.borderRadius};
    }

    // last item has border radius right
    // in case in edit mode, the last item is the 'add' button, so use
    // :nth-last-child to select the second last child
    &.noEdit .rc-tabs-tab:last-child,
    &:not(.noEdit) .rc-tabs-tab:nth-last-child(2) {
        border-top-right-radius: ${props => props.theme.borderRadius};
    }

    .rc-tabs-tab-btn,
    .rc-tabs-tab-remove {
        border: 0;
        background: transparent;
    }
    .rc-tabs-tab-btn {
        line-height: 32px;
    }
    .rc-tabs-tab-active {
        background: ${props => props.theme.primary};
        border: 1px solid ${props => props.theme.primary};
        color: #fff;
        cursor: initial !important;
        a {
            color: #fff !important;
        }
    }
    .rc-tabs-extra-content {
        flex: none;
    }
`;

export const AddContribution = styled(Button)`
    &&& {
        padding: 0;
        border: 1px solid ${props => props.theme.lightDarker};
        background-color: ${props => props.theme.lightLighter};
        border-radius: 60px;
        margin: 0 5px;
        cursor: pointer;
        outline: 0;
        color: inherit;

        span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 25px;
            height: 25px;
        }

        &:hover {
            background-color: ${props => props.theme.primary};
            border: 1px solid ${props => props.theme.primary};
            color: #fff;
        }
    }
`;

export const ActionButton = styled(Button)`
    &&& {
        color: inherit;
        padding: 0;
        line-height: 1;
        margin-top: -3px;
    }
`;
