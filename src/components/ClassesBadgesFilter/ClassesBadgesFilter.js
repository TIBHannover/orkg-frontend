import { useState, useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import Select, { components } from 'react-select';

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

    const Control = useCallback(({ ...innerProps }) => {
        return (
            <components.Control {...innerProps}>
                <div className="pl-2">Types ({innerProps.getValue()?.length} selected)</div>
                {innerProps.children}
            </components.Control>
        );
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
        container: provided => ({
            ...provided,
            padding: '0',
            border: '0',
            fontSize: '100%',
            position: 'relative',
            zIndex: '99'
        }),
        control: provided => ({
            ...provided,
            height: 'calc(1.5em + 0.5rem + 2px)',
            minHeight: 'calc(1.5em + 0.5rem + 2px)',
            fontSize: '100%'
        }),
        valueContainer: provided => ({
            ...provided,
            marginTop: '0',
            marginLeft: '6px',
            padding: '0',
            border: '0'
        }),
        input: provided => ({
            ...provided,
            color: 'transparent '
        }),
        dropdownIndicator: provided => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px'
        }),
        clearIndicator: provided => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px'
        }),
        indicatorsContainer: provided => ({
            ...provided,
            paddingRight: '4px',
            border: '0'
        })
    };

    return (
        <div className="mr-1" style={{ width: '180px' }}>
            <Select
                value={classes}
                onChange={handleSelect}
                options={filters}
                className="focus-primary"
                classNamePrefix="react-select"
                placeholder=""
                components={{ Control, MultiValueContainer: () => null, Option: CustomOption }}
                isMulti={true}
                hideSelectedOptions={false}
                getOptionLabel={({ label }) => label}
                getOptionValue={({ id }) => id}
                isClearable={false}
                styles={customStyles}
            />
        </div>
    );
}
