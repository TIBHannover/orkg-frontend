import classNames from 'classnames';
import type { ClassNamesConfig, CSSObjectWithLabel, GroupBase, StylesConfig } from 'react-select';
// Import to ensure module augmentation from Autocomplete.tsx is visible (adds groupPosition, size, rightAligned to Props)
import type {} from 'react-select/base';

import { OptionType } from '@/components/Autocomplete/types';

const controlStyles = {
    // !rounded-[inherit] so the control follows the container's radius (react-select's own 4px default wins otherwise)
    base: '!bg-field !border-border !cursor-pointer grow overflow-auto !rounded-[inherit]',
    focus: '!border-accent/25 !shadow-[0_0_0_0.2rem] !shadow-accent/25 !outline-0 transition-[border-color,box-shadow] duration-150 ease-in-out',
};

export const customClassNames: ClassNamesConfig<OptionType, boolean, GroupBase<OptionType>> = {
    container: (state) =>
        classNames('!p-0 !border-0 !flex', {
            '!rounded-[var(--field-radius)]': !state.selectProps.groupPosition,
            '!rounded-s-[var(--radius)] !rounded-e-none': state.selectProps.groupPosition === 'start',
            '!rounded-none': state.selectProps.groupPosition === 'middle',
            // lift the focused select above the joined neighbors so its focus ring isn't painted over
            '!z-10': state.isFocused,
        }),
    control: (state) =>
        classNames(controlStyles.base, {
            [controlStyles.focus]: state.isFocused,
            '!min-h-[inherit]': state.selectProps.size === 'sm',
        }),
    valueContainer: (state) => classNames({ '!py-0 !px-2': state.selectProps.size === 'sm' }),
    menu: () => '!bg-surface !text-foreground !border !border-border',
    menuList: () => '!bg-surface',
    option: (state) =>
        classNames('!cursor-pointer !text-foreground', {
            '!bg-accent !text-accent-foreground': state.isSelected,
            '!bg-accent/10': !state.isSelected && state.isFocused,
            '!bg-surface': !state.isSelected && !state.isFocused,
        }),
    noOptionsMessage: () => '!text-muted !bg-surface',
    singleValue: () => '!text-foreground',
    input: () => '!text-foreground',
    placeholder: () => '!text-muted',
    indicatorSeparator: () => '!bg-border',
    dropdownIndicator: (state) => classNames('!text-muted', { '!p-1': state.selectProps.size === 'sm' }),
    clearIndicator: (state) => classNames('!text-muted', { '!p-1': state.selectProps.size === 'sm' }),
    multiValue: () => '!bg-default !text-default-foreground',
    multiValueLabel: (state) =>
        classNames('!text-default-foreground', {
            '!pr-1.5': 'isFixed' in state.data && state.data.isFixed,
        }),
    multiValueRemove: (state) =>
        classNames('!cursor-pointer hover:!bg-danger/20 hover:!text-danger', {
            '!hidden': 'isFixed' in state.data && state.data.isFixed,
        }),
};

// Minimal styles prop for layout-critical properties that don't work reliably
// as Tailwind classes (react-select applies default inline styles that override classes)
export const customStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
    menu: (provided, state) =>
        ({
            ...provided,
            zIndex: 10,
            width: 'max-content',
            minWidth: '100%',
            maxWidth: 700,
            ...(state.selectProps.rightAligned ? { position: 'absolute', right: 0 } : {}),
        }) as CSSObjectWithLabel,
    menuPortal: (base) => ({ ...base, zIndex: 20000 }) as CSSObjectWithLabel,
};
