import { createGlobalStyle } from 'styled-components';

export const SelectGlobalStyle = createGlobalStyle`
    // react-select
    // can be activated in react select by using "classNamePrefix="react-select""
    .react-select__control {
        cursor: pointer !important;
        background: ${props => props.theme.inputBg}!important;
    }
    .react-select__control--is-focused {
        border-color: rgba(232, 97, 97, 0.25) !important;
        box-shadow: 0 0 0 0.2rem rgba(232, 97, 97, 0.25) !important;
        outline: 0 !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
    }
    .react-select__option--is-selected {
        background-color: ${props => props.theme.primary} !important;
    }
    .react-select__option {
        cursor: pointer !important;
    }
    .react-select__option--is-focused,
    .react-select__option:active {
        background: #fde8e8 !important;
        color: inherit !important;
    }
    // react-select-dark
    // can be activated in react select by using "classNamePrefix="react-select-dark""
    .react-select-dark__control {
        cursor: pointer !important;
    }
    .react-select-dark__control--is-focused {
        border-color: rgba(232, 97, 97, 0.25) !important;
        box-shadow: 0 0 0 0.2rem rgba(232, 97, 97, 0.25) !important;
        outline: 0 !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
    }
    .react-select-dark__option--is-selected {
        background-color: ${props => props.theme.secondary} !important;
    }
    .react-select-dark__option {
        cursor: pointer !important;
    }
    .react-select-dark__option--is-focused,
    .react-select-dark__option:active {
        background: ${props => props.theme.light} !important;
        color: inherit !important;
    }
`;
