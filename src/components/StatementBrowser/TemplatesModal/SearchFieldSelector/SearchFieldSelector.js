import { useContext } from 'react';
import Select from 'react-select';
//import { useSelector } from 'react-redux';
import { ThemeContext } from 'styled-components';
import PropTypes from 'prop-types';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';

const SearchFieldSelector = props => {
    const theme = useContext(ThemeContext);

    const customStyles = {
        container: provided => ({
            ...provided,
            flexBasis: '100px',
            padding: '0',
            border: '0',
            fontSize: '0.875rem',
            position: 'relative'
        }),
        control: provided => ({
            ...provided,
            borderTopLeftRadius: props.disableBorderRadiusLeft ? 0 : undefined,
            borderBottomLeftRadius: props.disableBorderRadiusLeft ? 0 : undefined,
            borderTopRightRadius: props.disableBorderRadiusRight ? 0 : undefined,
            borderBottomRightRadius: props.disableBorderRadiusRight ? 0 : undefined,
            ...(props.disableBorderRadiusRight ? { borderRight: 0 } : {}),
            backgroundColor: theme.light,
            color: theme.secondaryDarker
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
            color: theme.secondaryDarker
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
        }),
        menu: provided => ({
            ...provided,
            fontSize: '0.875rem'
        })
    };

    return (
        <>
            <Select
                styles={customStyles}
                classNamePrefix="react-select-dark"
                value={props.value}
                options={props.options}
                onChange={v => props.setValue(v)}
                getOptionValue={({ id }) => id}
                getOptionLabel={({ label }) => `By ${label}`}
                isClearable={false}
            />
            <SelectGlobalStyle />
        </>
    );
};

SearchFieldSelector.propTypes = {
    value: PropTypes.object,
    setValue: PropTypes.func,
    options: PropTypes.array,
    disableBorderRadiusLeft: PropTypes.bool,
    disableBorderRadiusRight: PropTypes.bool
};

SearchFieldSelector.defaultProps = {
    disableBorderRadiusLeft: false,
    disableBorderRadiusRight: true
};

export default SearchFieldSelector;
