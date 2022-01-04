import styled from 'styled-components';

export const ResponsiveTabs = styled.div`
    .RRT__container {
        position: relative;
    }

    /****************************/
    /******** tab styles ********/
    /****************************/
    .RRT__tabs {
        display: flex;
        flex-wrap: wrap;
    }

    .RRT__accordion {
        flex-direction: column;
    }

    .RRT__tab {
        flex: 1;
        margin-bottom: 0;
        padding: 15px;
        color: #bebbac;
        cursor: pointer;
        border-bottom: 2px solid ${props => props.theme.lightDarker};
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        cursor: pointer;
        z-index: 1;
        white-space: nowrap;
    }

    .RRT__tab:focus {
        outline: 0;
        background-color: #fff;
    }

    .RRT__accordion .RRT__tab {
        border-left-width: 1px;
    }

    .RRT__tab--first {
        border-left-width: 1px;
    }

    .RRT__tab--selected {
        border-bottom: 2px solid #e86161;
        color: #646464;
    }

    .RRT__tab--selected:focus {
        background-color: #fff;
    }

    .RRT__tab--disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .RRT__tab:focus {
        z-index: 2;
    }

    .RRT__tab--selected .RRT__removable {
        position: relative;
    }

    .RRT__tab--selected .RRT__removable-text {
        margin-right: 10px;
    }

    .RRT__tab--selected .RRT__removable-icon {
        position: absolute;
        font-size: 18px;
        right: 0.5em;
        top: 0.2em;
    }

    /****************************/
    /********* panel styles *****/
    /****************************/
    .RRT__panel {
        margin-top: -1px;
        padding: 0;
        border: 1px solid #ddd;
    }

    .RRT__panel--hidden {
        display: none;
    }

    .RRT__accordion .RRT__panel {
        margin-top: 0;
    }

    /****************************/
    /******* showmore control ***/
    /****************************/
    .RRT__showmore {
        background: #eee;
        border: 1px solid #ddd;
        cursor: pointer;
        z-index: 1;
        white-space: nowrap;
        margin-left: -1px;
        position: relative;
    }

    .RRT__showmore--selected {
        background: white;
        border-bottom: none;
    }

    .RRT__showmore-label {
        padding: 0.7em 1em;
        position: relative;
        bottom: -1px;
        z-index: 1;
    }

    .RRT__showmore-label--selected {
        background-color: #eee;
    }

    .RRT__showmore-list {
        position: absolute;
        right: -1px;
        top: 100%;
        display: none;
        background: #eee;
    }

    .RRT__showmore-list--opened {
        display: block;
    }

    /****************************/
    /********** inkbar **********/
    /****************************/
    .RRT__inkbar-wrapper {
        width: 100%;
    }

    .RRT__inkbar {
        position: relative;
        bottom: 0;
        height: 2px;
        margin-top: -2px;
        background-color: deepskyblue;
        transition: left 800ms cubic-bezier(0.23, 1, 0.32, 1);
        z-index: 2;
    }
`;
