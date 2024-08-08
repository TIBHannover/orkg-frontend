import styled from 'styled-components';
import { Button } from 'reactstrap';

export const TabHeaderStyle = styled.div`
    align-items: center;
    padding: 12px 16px;
    font-size: 16px;
    border: 0;
    border-radius: 0;
    border-bottom-width: 2px;
    border-color: ${(props) => props.theme.lightDarker};
    border-style: solid;
`;

export const ORKGTabsStyle = styled.div`
    .rc-tabs-small > .rc-tabs-nav .rc-tabs-tab {
        padding: 8px 0;
        font-size: 14px;
    }
    .rc-tabs-large > .rc-tabs-nav .rc-tabs-tab {
        padding: 16px 0;
        font-size: 16px;
    }
    .rc-tabs-card.rc-tabs-small > .rc-tabs-nav .rc-tabs-tab {
        padding: 6px 16px;
    }
    .rc-tabs-card.rc-tabs-small.rc-tabs-bottom > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 0 0 6px 6px;
    }
    .rc-tabs-card.rc-tabs-small.rc-tabs-top > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 6px 6px 0 0;
    }
    .rc-tabs-card.rc-tabs-small.rc-tabs-right > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 0 6px 6px 0;
    }
    .rc-tabs-card.rc-tabs-small.rc-tabs-left > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 6px 0 0 6px;
    }
    .rc-tabs-card.rc-tabs-large > .rc-tabs-nav .rc-tabs-tab {
        padding: 8px 16px 6px;
    }
    .rc-tabs-rtl {
        direction: rtl;
    }
    .rc-tabs-rtl .rc-tabs-nav .rc-tabs-tab {
        margin: 0 0 0 32px;
    }
    .rc-tabs-rtl .rc-tabs-nav .rc-tabs-tab .rc-tabs-tab:last-of-type {
        margin-left: 0;
    }
    .rc-tabs-rtl .rc-tabs-nav .rc-tabs-tab .anticon {
        margin-right: 0;
        margin-left: 12px;
    }
    .rc-tabs-rtl .rc-tabs-nav .rc-tabs-tab .rc-tabs-tab-remove {
        margin-right: 8px;
        margin-left: -4px;
    }
    .rc-tabs-rtl .rc-tabs-nav .rc-tabs-tab .rc-tabs-tab-remove .anticon {
        margin: 0;
    }
    .rc-tabs-rtl.rc-tabs-left > .rc-tabs-nav {
        order: 1;
    }
    .rc-tabs-rtl.rc-tabs-left > .rc-tabs-content-holder {
        order: 0;
    }
    .rc-tabs-rtl.rc-tabs-right > .rc-tabs-nav {
        order: 0;
    }
    .rc-tabs-rtl.rc-tabs-right > .rc-tabs-content-holder {
        order: 1;
    }
    .rc-tabs-rtl.rc-tabs-card.rc-tabs-top > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-rtl.rc-tabs-card.rc-tabs-bottom > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-rtl.rc-tabs-card.rc-tabs-top > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-rtl.rc-tabs-card.rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab {
        margin-right: 2px;
        margin-left: 0;
    }
    .rc-tabs-dropdown-rtl {
        direction: rtl;
    }
    .rc-tabs-menu-item .rc-tabs-dropdown-rtl {
        text-align: right;
    }
    .rc-tabs-top,
    .rc-tabs-bottom {
        flex-direction: column;
    }
    .rc-tabs-top > .rc-tabs-nav::before,
    .rc-tabs-bottom > .rc-tabs-nav::before,
    .rc-tabs-top > div > .rc-tabs-nav::before,
    .rc-tabs-bottom > div > .rc-tabs-nav::before {
        position: absolute;
        right: 0;
        left: 0;
        border-bottom: 2px solid rgba(5, 5, 5, 0.06);
        content: '';
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-ink-bar {
        height: 2px;
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-ink-bar-animated {
        transition: width 0.3s, left 0.3s, right 0.3s;
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap::after {
        top: 0;
        bottom: 0;
        width: 32px;
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap::before {
        left: 0;
        box-shadow: inset 10px 0 8px -8px rgba(0, 0, 0, 0.08);
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap::after {
        right: 0;
        box-shadow: inset -10px 0 8px -8px rgba(0, 0, 0, 0.08);
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-left::before,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-left::before,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-left::before,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-left::before {
        opacity: 1;
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-right::after,
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-right::after,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-right::after,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-right::after {
        opacity: 1;
    }
    .rc-tabs-top > .rc-tabs-nav::before,
    .rc-tabs-top > div > .rc-tabs-nav::before {
        bottom: 0;
    }
    .rc-tabs-top > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-top > div > .rc-tabs-nav .rc-tabs-ink-bar {
        bottom: 0;
    }
    .rc-tabs-bottom > .rc-tabs-nav,
    .rc-tabs-bottom > div > .rc-tabs-nav {
        order: 1;
        margin-top: 16px;
        margin-bottom: 0;
    }
    .rc-tabs-bottom > .rc-tabs-nav::before,
    .rc-tabs-bottom > div > .rc-tabs-nav::before {
        top: 0;
    }
    .rc-tabs-bottom > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-ink-bar {
        top: 0;
    }
    .rc-tabs-bottom > .rc-tabs-content-holder,
    .rc-tabs-bottom > div > .rc-tabs-content-holder {
        order: 0;
    }
    .rc-tabs-left > .rc-tabs-nav,
    .rc-tabs-right > .rc-tabs-nav,
    .rc-tabs-left > div > .rc-tabs-nav,
    .rc-tabs-right > div > .rc-tabs-nav {
        flex-direction: column;
        min-width: 40px;
        border-width:0 !important;
        padding-top: 15px;
        padding-bottom: 15px;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-tab {
        padding: 8px 24px;
        text-align: center;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab {
        margin: 8px 0 0 0;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap {
        flex-direction: column;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap::after {
        right: 0;
        left: 0;
        height: 32px;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap::before {
        top: 0;
        box-shadow: inset 0 10px 8px -8px rgba(0, 0, 0, 0.08);
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap::after {
        bottom: 0;
        box-shadow: inset 0 -10px 8px -8px rgba(0, 0, 0, 0.08);
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-top::before,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-top::before,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-top::before,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-top::before {
        opacity: 1;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-bottom::after,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-bottom::after,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-bottom::after,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-wrap.rc-tabs-nav-wrap-ping-bottom::after {
        opacity: 1;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-ink-bar {
        width: 2px;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-ink-bar-animated,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-ink-bar-animated {
        transition: height 0.3s, top 0.3s;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-list,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-list,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-list,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-list,
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-nav-operations,
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-nav-operations,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-nav-operations,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-nav-operations {
        flex: 1 0 auto;
        flex-direction: column;
    }
    .rc-tabs-left > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-left > div > .rc-tabs-nav .rc-tabs-ink-bar {
        right: 0;
    }
    .rc-tabs-left > .rc-tabs-content-holder,
    .rc-tabs-left > div > .rc-tabs-content-holder {
        border-radius: ${(props) => props.theme.borderRadius} !important;
        border: ${(props) => props.theme.borderWidth} solid ${(props) => props.theme.primary} !important;
        padding: 15px 30px;
    }
    .rc-tabs-left > .rc-tabs-content-holder > .rc-tabs-content > .rc-tabs-tabpane,
    .rc-tabs-left > div > .rc-tabs-content-holder > .rc-tabs-content > .rc-tabs-tabpane {
        padding-left: 0;
    }
    .rc-tabs-right > .rc-tabs-nav,
    .rc-tabs-right > div > .rc-tabs-nav {
        order: 1;
    }
    .rc-tabs-right > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-right > div > .rc-tabs-nav .rc-tabs-ink-bar {
        left: 0;
    }
    .rc-tabs-right > .rc-tabs-content-holder,
    .rc-tabs-right > div > .rc-tabs-content-holder {
        order: 0;
        margin-right: -1px;
        border-right: 1px solid #d9d9d9;
    }
    .rc-tabs-right > .rc-tabs-content-holder > .rc-tabs-content > .rc-tabs-tabpane,
    .rc-tabs-right > div > .rc-tabs-content-holder > .rc-tabs-content > .rc-tabs-tabpane {
        padding-right: 24px;
    }
    .rc-tabs-dropdown {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-size: 16px;
        list-style: none;
        position: absolute;
        top: -9999px;
        left: -9999px;
        z-index: 1050;
        display: block;
    }
    .rc-tabs-dropdown-hidden {
        display: none;
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu {
        max-height: 200px;
        margin: 0;
        padding: 4px 0;
        overflow-x: hidden;
        overflow-y: auto;
        text-align: left;
        list-style-type: none;
        background-color: #ffffff;
        background-clip: padding-box;
        border-radius: 8px;
        outline: none;
        box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        display: flex;
        align-items: center;
        min-width: 120px;
        margin: 0;
        padding: 4px 12px;
        color: rgba(0, 0, 0, 0.88);
        font-weight: normal;
        font-size: 14px;
        line-height: 1.5714285714285714;
        cursor: pointer;
        transition: all 0.3s;
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item > span {
        flex: 1;
        white-space: nowrap;
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item-remove {
        flex: none;
        margin-left: 12px;
        background: transparent;
        border: 0;
        cursor: pointer;
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item-remove:hover {
        color: ${(props) => props.theme.primary};
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item:hover {
        background: rgba(0, 0, 0, 0.04);
    }
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item-disabled,
    .rc-tabs-dropdown .rc-tabs-dropdown-menu-item-disabled:hover {
        color: rgba(0, 0, 0, 0.25);
        background: transparent;
        cursor: not-allowed;
    }
    .rc-tabs-card > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-card > div > .rc-tabs-nav .rc-tabs-tab {
        margin: 0;
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(5, 5, 5, 0.06);
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .rc-tabs-card > .rc-tabs-nav .rc-tabs-tab-active,
    .rc-tabs-card > div > .rc-tabs-nav .rc-tabs-tab-active {
        color: ${(props) => props.theme.primary};
        background: #ffffff;
    }
    .rc-tabs-card > .rc-tabs-nav .rc-tabs-ink-bar,
    .rc-tabs-card > div > .rc-tabs-nav .rc-tabs-ink-bar {
        visibility: hidden;
    }
    .rc-tabs-card.rc-tabs-top > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-bottom > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-top > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab {
        margin-left: 2px;
    }
    .rc-tabs-card.rc-tabs-top > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-top > div > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 8px 8px 0 0;
    }
    .rc-tabs-card.rc-tabs-top > .rc-tabs-nav .rc-tabs-tab-active,
    .rc-tabs-card.rc-tabs-top > div > .rc-tabs-nav .rc-tabs-tab-active {
        border-bottom-color: #ffffff;
    }
    .rc-tabs-card.rc-tabs-bottom > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 0 0 8px 8px;
    }
    .rc-tabs-card.rc-tabs-bottom > .rc-tabs-nav .rc-tabs-tab-active,
    .rc-tabs-card.rc-tabs-bottom > div > .rc-tabs-nav .rc-tabs-tab-active {
        border-top-color: #ffffff;
    }
    .rc-tabs-card.rc-tabs-left > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-right > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-left > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-right > div > .rc-tabs-nav .rc-tabs-tab + .rc-tabs-tab {
        margin-top: 2px;
    }
    .rc-tabs-card.rc-tabs-left > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-left > div > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 8px 0 0 8px;
    }
    .rc-tabs-card.rc-tabs-left > .rc-tabs-nav .rc-tabs-tab-active,
    .rc-tabs-card.rc-tabs-left > div > .rc-tabs-nav .rc-tabs-tab-active {
        border-right-color: #ffffff;
    }
    .rc-tabs-card.rc-tabs-right > .rc-tabs-nav .rc-tabs-tab,
    .rc-tabs-card.rc-tabs-right > div > .rc-tabs-nav .rc-tabs-tab {
        border-radius: 0 8px 8px 0;
    }
    .rc-tabs-card.rc-tabs-right > .rc-tabs-nav .rc-tabs-tab-active,
    .rc-tabs-card.rc-tabs-right > div > .rc-tabs-nav .rc-tabs-tab-active {
        border-left-color: #ffffff;
    }
    .rc-tabs {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
    }
    .rc-tabs > .rc-tabs-nav,
    .rc-tabs > div > .rc-tabs-nav {
        position: relative;
        display: flex;
        flex: none;
        align-items: center;
        background #fff;
        border-radius: ${(props) => props.theme.borderRadius};
        border-width: ${(props) => props.theme.borderWidth};
        border-color: ${(props) => props.theme.lightDarker};
        border-style: solid;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom:0;
    }
    /* For nested tab styling */
    .rc-tabs .rc-tabs .rc-tabs-nav {
        border-width: 0!important;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-wrap,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-wrap {
        position: relative;
        display: flex;
        flex: auto;
        align-self: stretch;
        overflow: hidden;
        white-space: nowrap;
        transform: translate(0);
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-wrap::before,
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-wrap::after,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-wrap::after {
        position: absolute;
        z-index: 1;
        opacity: 0;
        transition: opacity 0.3s;
        content: '';
        pointer-events: none;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-list,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-list {
        position: relative;
        display: flex;
        transition: opacity 0.3s;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-operations,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-operations {
        display: flex;
        align-self: stretch;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-operations-hidden,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-operations-hidden {
        position: absolute;
        visibility: hidden;
        pointer-events: none;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-more,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-more {
        position: relative;
        padding: 8px 16px;
        background: transparent;
        border: 0;
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-more::after,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-more::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 5px;
        transform: translateY(100%);
        content: '';
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-add,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-add {
        min-width: 40px;
        margin-left: 2px;
        padding: 0 8px;
        background: transparent;
        border: 1px solid rgba(5, 5, 5, 0.06);
        border-radius: 8px 8px 0 0;
        outline: none;
        cursor: pointer;
        color: rgba(0, 0, 0, 0.88);
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-add:hover,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-add:hover {
        color: ${(props) => props.theme.primary};
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-add:active,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-add:active,
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-add:focus:not(:focus-visible),
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-add:focus:not(:focus-visible) {
        color: ${(props) => props.theme.primary};
    }
    .rc-tabs > .rc-tabs-nav .rc-tabs-nav-add:focus-visible,
    .rc-tabs > div > .rc-tabs-nav .rc-tabs-nav-add:focus-visible {
        outline: 4px solid #91caff;
        outline-offset: 1px;
        transition: outline-offset 0s, outline 0s;
    }
    .rc-tabs .rc-tabs-extra-content {
        flex: none;
    }
    .rc-tabs .rc-tabs-ink-bar {
        position: absolute;
        background: ${(props) => props.theme.primary};
        pointer-events: none;
    }
    /* For nested tab styling */
    .rc-tabs .rc-tabs .rc-tabs-ink-bar {
        background: ${(props) => props.theme.secondary};
    }
    .rc-tabs .rc-tabs-tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        padding: 12px 16px;
        font-size: 16px;
        background: transparent;
        border: 0;
        outline: none;
        cursor: pointer;
    }
    .rc-tabs-left .rc-tabs-tab {
        padding: 12px 10px 12px 15px;
        transition: 0.3s background;
        border-top-left-radius: ${(props) => props.theme.borderRadius};
        border-bottom-left-radius: ${(props) => props.theme.borderRadius};
        border: 1px solid ${(props) => props.theme.lightDarker};
        background-color: ${(props) => props.theme.lightLighter};
    }

    .rc-tabs .rc-tabs-tab-btn:focus:not(:focus-visible),
    .rc-tabs .rc-tabs-tab-remove:focus:not(:focus-visible),
    .rc-tabs .rc-tabs-tab-btn:active,
    .rc-tabs .rc-tabs-tab-remove:active {
        color: ${(props) => props.theme.primary};
    }
    .rc-tabs .rc-tabs-tab-btn:focus-visible,
    .rc-tabs .rc-tabs-tab-remove:focus-visible {
        outline: 4px solid #91caff;
        outline-offset: 1px;
        transition: outline-offset 0s, outline 0s;
    }
    .rc-tabs .rc-tabs-tab-btn {
        outline: none;
        transition: all 0.3s;
    }
    .rc-tabs .rc-tabs-tab-remove {
        flex: none;
        margin-right: -4px;
        margin-left: 8px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 12px;
        background: transparent;
        border: none;
        outline: none;
        cursor: pointer;
        transition: all 0.3s;
    }
    .rc-tabs .rc-tabs-tab-remove:hover {
        color: rgba(0, 0, 0, 0.88);
    }
    .rc-tabs .rc-tabs-tab:hover {
        color: ${(props) => props.theme.primary};
    }
    /* For nested tab styling */
    .rc-tabs .rc-tabs .rc-tabs-tab:hover {
        color: ${(props) => props.theme.secondary};
    }
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-active .rc-tabs-tab-btn {
        color: ${(props) => props.theme.primary};
    }
    /* For nested tab styling */
    .rc-tabs .rc-tabs .rc-tabs-tab.rc-tabs-tab-active .rc-tabs-tab-btn {
        color: ${(props) => props.theme.secondary};
    }
    .rc-tabs-left .rc-tabs-tab.rc-tabs-tab-active {
        background: ${(props) => props.theme.primary};
        color: #fff;
        cursor: initial !important;
        border-color: ${(props) => props.theme.primary};
    }
    .rc-tabs-left .rc-tabs-tab.rc-tabs-tab-active .rc-tabs-tab-btn {
        color: #fff;
    }
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-disabled {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
    }
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-disabled .rc-tabs-tab-btn:focus,
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-disabled .rc-tabs-remove:focus,
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-disabled .rc-tabs-tab-btn:active,
    .rc-tabs .rc-tabs-tab.rc-tabs-tab-disabled .rc-tabs-remove:active {
        color: rgba(0, 0, 0, 0.25);
    }
    .rc-tabs .rc-tabs-tab .rc-tabs-tab-remove .anticon {
        margin: 0;
    }
    .rc-tabs .rc-tabs-tab .anticon {
        margin-right: 12px;
    }
    .rc-tabs .rc-tabs-tab + .rc-tabs-tab {
        margin: 0 0 0 10px;
    }
    .rc-tabs .rc-tabs-content {
        position: relative;
        width: 100%;
    }
    .rc-tabs .rc-tabs-content-holder {
        flex: auto;
        min-width: 0;
        min-height: 0;
        background:#fff;
        border-radius: ${(props) => props.theme.borderRadius};
        border-width: ${(props) => props.theme.borderWidth};
        border-color: ${(props) => props.theme.lightDarker};
        border-style: solid;
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-top:0;
    }
    /* For nested tab styling */
    .rc-tabs .rc-tabs-content-holder .rc-tabs .rc-tabs-content-holder {
        border-width: 0;
    }
    .rc-tabs .rc-tabs-tabpane {
        outline: none;
    }
    .rc-tabs .rc-tabs-tabpane-hidden {
        display: none;
    }
    .rc-tabs-centered > .rc-tabs-nav .rc-tabs-nav-wrap:not([class*='.rc-tabs-nav-wrap-ping']),
    .rc-tabs-centered > div > .rc-tabs-nav .rc-tabs-nav-wrap:not([class*='.rc-tabs-nav-wrap-ping']) {
        justify-content: center;
    }
    .rc-tabs .rc-tabs-switch-appear,
    .rc-tabs .rc-tabs-switch-enter {
        transition: none;
    }
    .rc-tabs .rc-tabs-switch-appear-start,
    .rc-tabs .rc-tabs-switch-enter-start {
        opacity: 0;
    }
    .rc-tabs .rc-tabs-switch-appear-active,
    .rc-tabs .rc-tabs-switch-enter-active {
        opacity: 1;
        transition: opacity 0.3s;
    }
    .rc-tabs .rc-tabs-switch-leave {
        position: absolute;
        transition: none;
        inset: 0;
    }
    .rc-tabs .rc-tabs-switch-leave-start {
        opacity: 1;
    }
    .rc-tabs .rc-tabs-switch-leave-active {
        opacity: 0;
        transition: opacity 0.3s;
    }
    .ant-slide-up-enter,
    .ant-slide-up-appear {
        animation-duration: 0.2s;
        animation-fill-mode: both;
        animation-play-state: paused;
    }
    .ant-slide-up-leave {
        animation-duration: 0.2s;
        animation-fill-mode: both;
        animation-play-state: paused;
    }
    .ant-slide-up-enter.ant-slide-up-enter-active,
    .ant-slide-up-appear.ant-slide-up-appear-active {
        animation-name: css-10ed4xt-antSlideUpIn;
        animation-play-state: running;
    }
    .ant-slide-up-leave.ant-slide-up-leave-active {
        animation-name: css-10ed4xt-antSlideUpOut;
        animation-play-state: running;
        pointer-events: none;
    }
    .ant-slide-up-enter,
    .ant-slide-up-appear {
        transform: scale(0);
        transform-origin: 0% 0%;
        opacity: 0;
        animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
    }
    .ant-slide-up-leave {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    }
    .ant-slide-down-enter,
    .ant-slide-down-appear {
        animation-duration: 0.2s;
        animation-fill-mode: both;
        animation-play-state: paused;
    }
    .ant-slide-down-leave {
        animation-duration: 0.2s;
        animation-fill-mode: both;
        animation-play-state: paused;
    }
    .ant-slide-down-enter.ant-slide-down-enter-active,
    .ant-slide-down-appear.ant-slide-down-appear-active {
        animation-name: css-10ed4xt-antSlideDownIn;
        animation-play-state: running;
    }
    .ant-slide-down-leave.ant-slide-down-leave-active {
        animation-name: css-10ed4xt-antSlideDownOut;
        animation-play-state: running;
        pointer-events: none;
    }
    .ant-slide-down-enter,
    .ant-slide-down-appear {
        transform: scale(0);
        transform-origin: 0% 0%;
        opacity: 0;
        animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
    }
    .ant-slide-down-leave {
        animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    }
`;

export const AddContribution = styled(Button)`
    &&& {
        padding: 0;
        border: 1px solid ${(props) => props.theme.lightDarker};
        background-color: ${(props) => props.theme.lightLighter};
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
            background-color: ${(props) => props.theme.primary};
            border: 1px solid ${(props) => props.theme.primary};
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
