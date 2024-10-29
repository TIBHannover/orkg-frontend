import { OptionType } from 'components/Autocomplete/types';
import type { CSSObjectWithLabel, GroupBase, StylesConfig } from 'react-select';
import styled, { createGlobalStyle } from 'styled-components';

export const SelectGlobalStyle = createGlobalStyle`
    // react-select
    // can be activated in react select by using "classNamePrefix="react-select""
    .react-select__control {
        cursor: pointer !important;
        background: ${(props) => props.theme.inputBg}!important;
    }
    .react-select__control--is-focused {
        border-color: rgba(232, 97, 97, 0.25) !important;
        box-shadow: 0 0 0 0.2rem rgba(232, 97, 97, 0.25) !important;
        outline: 0 !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
    }
    .react-select__option--is-selected {
        background-color: ${(props) => props.theme.primary} !important;
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
        background-color: ${(props) => props.theme.light} !important; 
        color: ${(props) => props.theme.secondaryDarker} !important; 
    }
    .react-select-dark__control--is-focused {
        border-color: rgba(232, 97, 97, 0.25) !important;
        box-shadow: 0 0 0 0.2rem rgba(232, 97, 97, 0.25) !important;
        outline: 0 !important;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out !important;
    }
    .react-select-dark__option--is-selected {
        background-color: ${(props) => props.theme.secondary} !important;
    }
    .react-select-dark__option {
        cursor: pointer !important;
    }
    .react-select-dark__option--is-focused,
    .react-select-dark__option:active {
        background: ${(props) => props.theme.light} !important;
        color: inherit !important;
    }
`;

export const SourceBadge = styled.a`
    background-color: ${(props) => props.theme.light};
    border-radius: 2em;
    color: ${(props) => props.theme.bodyColor};
    font-size: 12px;
`;

export const customClassNames = {
    // @ts-expect-error state should be state manager of react select
    container: (state) =>
        `${state.selectProps.noFormControl ? '' : 'form-control'} p-0 border-0 ${
            state.selectProps.size && state.selectProps.size === 'sm' ? 'form-control-sm' : ''
        }`,
};

export const customStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
    container: (provided, state) =>
        ({
            ...provided,
            // @ts-expect-error state should be state manager of react select
            ...(state.selectProps.noFormControl ? { borderRadius: '6px 0 0 6px' } : {}),
        } as CSSObjectWithLabel),
    control: (provided, state) =>
        ({
            ...provided,
            ...(state.selectProps.size && state.selectProps.size === 'sm' ? { minHeight: 'inherit !important' } : {}),
            borderTopLeftRadius: 'inherit',
            borderBottomLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            borderBottomRightRadius: 'inherit',
            '&>div:first-of-type': {
                ...(state.selectProps.size && state.selectProps.size === 'sm' ? { padding: '0 8px !important' } : {}),
            },
        } as CSSObjectWithLabel),
    clearIndicator: (provided, state) =>
        ({ ...provided, ...(state.selectProps.size && state.selectProps.size === 'sm' ? { padding: '4px !important' } : {}) } as CSSObjectWithLabel),
    indicatorsContainer: (provided, state) =>
        ({
            ...provided,
            '&>div:last-of-type': {
                // openMenu buttons
                ...(state.selectProps.size && state.selectProps.size === 'sm' ? { padding: '4px !important' } : {}),
            },
            '&>div:nth-last-of-type(2)': {
                // clear button
                ...(state.selectProps.size && state.selectProps.size === 'sm' && !state.selectProps.isDisabled && state.selectProps.isClearable
                    ? { padding: '4px !important' }
                    : {}),
            },
        } as CSSObjectWithLabel),
    menu: (provided) =>
        ({
            ...provided,
            zIndex: 10,
            width: 'max-content', // making sure the menu can be wider than the input size
            minWidth: '100%',
            maxWidth: 700,
        } as CSSObjectWithLabel),
    multiValueLabel: (provided, state) =>
        ({
            ...provided,
            ...('isFixed' in state.data && state.data.isFixed ? { paddingRight: '6px' } : {}),
        } as CSSObjectWithLabel),
    multiValueRemove: (provided, state) =>
        ({
            ...provided,
            ...('isFixed' in state.data && state.data.isFixed ? { display: 'none' } : {}),
            cursor: 'pointer',
        } as CSSObjectWithLabel),
};

export default SelectGlobalStyle;
