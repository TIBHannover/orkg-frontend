import { useContext } from 'react';
import Select, { components } from 'react-select';
//import { useSelector } from 'react-redux';
import DATA_TYPES, { getConfigByType } from 'constants/DataTypes';
import { ThemeContext } from 'styled-components';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const DatatypeSelector = props => {
    // const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const theme = useContext(ThemeContext);

    const CustomOption = innerProps => (
        <components.Option {...innerProps}>
            <Tippy content={innerProps.data.tooltip} disabled={!innerProps.data.tooltip}>
                <div>{innerProps.data.name}</div>
            </Tippy>
        </components.Option>
    );
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
            height: '100% !important',
            minHeight: 'calc(1.5em + 0.5rem + 2px)',
            fontSize: '100%',
            borderTopLeftRadius: props.disableBorderRadiusLeft ? 0 : 'inherit',
            borderBottomLeftRadius: props.disableBorderRadiusLeft ? 0 : 'inherit',
            borderTopRightRadius: props.disableBorderRadiusRight ? 0 : 'inherit',
            borderBottomRightRadius: props.disableBorderRadiusRight ? 0 : 'inherit',
            borderRight: 0,
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
        })
    };

    return (
        <>
            <Select
                styles={customStyles}
                classNamePrefix="react-select-dark"
                value={getConfigByType(props.valueType)}
                components={{ Option: CustomOption }}
                options={!props.entity ? DATA_TYPES : DATA_TYPES.filter(dt => dt._class === props.entity)}
                onChange={v => props.setValueType(v.type)}
                getOptionValue={({ type }) => type}
                getOptionLabel={({ name }) => name}
                isClearable={false}
            />
        </>
    );
};

DatatypeSelector.propTypes = {
    valueType: PropTypes.string,
    setValueType: PropTypes.func,
    entity: PropTypes.string,
    disableBorderRadiusLeft: PropTypes.bool,
    disableBorderRadiusRight: PropTypes.bool
};

DatatypeSelector.defaultProps = {
    disableBorderRadiusLeft: false,
    disableBorderRadiusRight: true
};

export default DatatypeSelector;
