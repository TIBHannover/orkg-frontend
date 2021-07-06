import { useCallback } from 'react';
import Select, { components } from 'react-select';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const ClassesBadgesFilter = props => {
    const handleSelect = value => {
        if (value.length < 1) {
            toast.dismiss();
            toast.info('At least one type should be selected');
        } else {
            props.setClassesFilter(value);
        }
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
                value={props.classesFilter}
                onChange={handleSelect}
                options={props.initialClassFilterOptions}
                className="focus-primary"
                classNamePrefix="react-select"
                placeholder=""
                components={{ Control, MultiValueContainer: () => null, Option: CustomOption }}
                isMulti={true}
                hideSelectedOptions={false}
                getOptionLabel={({ label }) => label}
                openMenuOnClick={true}
                getOptionValue={({ id }) => id}
                isClearable={false}
                isDisabled={props.disabled}
                styles={customStyles}
                blurInputOnSelect={true}
            />
        </div>
    );
};

ClassesBadgesFilter.propTypes = {
    initialClassFilterOptions: PropTypes.array.isRequired,
    setClassesFilter: PropTypes.func.isRequired,
    classesFilter: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};

ClassesBadgesFilter.defaultProps = {
    disabled: false
};

export default ClassesBadgesFilter;
