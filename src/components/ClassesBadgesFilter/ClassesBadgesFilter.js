import { useState, useContext, useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import Select, { components } from 'react-select';
import { ThemeContext } from 'styled-components';

export default function ClassesBadgesFilter() {
    const filters = [
        { id: CLASSES.PAPER, label: 'Paper' },
        { id: CLASSES.COMPARISON, label: 'Comparison' },
        { id: CLASSES.VISUALIZATION, label: 'Visualization' },
        { id: CLASSES.SMART_REVIEW, label: 'SmartReview' }
    ];
    const [classes, setClasses] = useState(filters.slice(1));
    const handleSelect = value => {
        setClasses(value);
    };

    const CustomValueContainer = useCallback(innerProps => {
        return <components.ValueContainer {...innerProps}>Types ({innerProps.getValue()?.length} selected)</components.ValueContainer>;
    }, []);

    const CustomOption = useCallback(innerProps => {
        return (
            <div>
                <components.Option {...innerProps}>
                    <div className="d-flex">
                        <input className="d-inline-block mr-2" type="checkbox" checked={innerProps.isSelected} onChange={() => null} />{' '}
                        <label className="m-0">{innerProps.value}</label>{' '}
                    </div>
                </components.Option>
            </div>
        );
    }, []);
    const customStyles = {
        container: (provided, state) => ({
            ...provided,
            padding: '0',
            border: '0',
            fontSize: '100%',
            position: 'relative',
            zIndex: '99'
        }),
        control: (provided, state) => ({
            ...provided,
            height: 'calc(1.5em + 0.5rem + 2px)',
            minHeight: 'calc(1.5em + 0.5rem + 2px)',
            fontSize: '100%',
            borderColor: '#d8dbe0',
            boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075)',
            transition: 'background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
            ':hover': {
                borderColor: state.isFocused ? '#66afe9' : '#d8dbe0',
                boxShadow: state.isFocused
                    ? 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)'
                    : 'inset 0 1px 1px rgba(0, 0, 0, 0.075)'
            }
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            marginTop: '0',
            marginLeft: '6px',
            padding: '0',
            border: '0'
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px'
        }),
        clearIndicator: (provided, state) => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px'
        }),
        indicatorsContainer: (provided, state) => ({
            ...provided,
            paddingRight: '4px',
            border: '0'
        })
    };
    return (
        <div className="mr-1" style={{ width: '200px' }}>
            <Select
                value={classes}
                onChange={handleSelect}
                options={filters}
                blurInputOnSelect
                className="focus-primary"
                classNamePrefix="react-select"
                placeholder="Select type"
                components={{ ValueContainer: CustomValueContainer, Option: CustomOption }}
                isMulti={true}
                hideSelectedOptions={false}
                getOptionLabel={({ label }) => label}
                getOptionValue={({ id }) => id}
                isClearable={false}
                openMenuOnFocus={true}
                styles={customStyles}
            />
        </div>
    );
}
