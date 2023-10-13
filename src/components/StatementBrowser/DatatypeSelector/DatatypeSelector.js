import Link from 'components/NextJsMigration/Link';
import { useContext, useCallback } from 'react';
import Select, { components } from 'react-select';
import DATA_TYPES, { getConfigByType } from 'constants/DataTypes';
import { ENTITIES } from 'constants/graphSettings';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { ThemeContext } from 'styled-components';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';

const TypeTooltipContent = ({ valueClass, entity, switchEntityType }) => (
    <>
        {valueClass || !switchEntityType ? 'Type is determined by the template.' : 'Changing the type is not possible'}
        {valueClass && entity === ENTITIES.RESOURCE && (
            <div>
                Only instances of{' '}
                <Link target="_blank" href={reverse(ROUTES.CLASS, { id: valueClass.id })}>
                    {valueClass.label}
                </Link>{' '}
                are valid.
            </div>
        )}
    </>
);

TypeTooltipContent.propTypes = {
    entity: PropTypes.string,
    valueClass: PropTypes.object,
    switchEntityType: PropTypes.bool,
};

const DatatypeSelector = props => {
    // const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const theme = useContext(ThemeContext);

    const CustomOption = useCallback(
        innerProps => (
            <components.Option {...innerProps}>
                <Tippy content={innerProps.data.tooltip} disabled={!innerProps.data.tooltip}>
                    <div>{innerProps.data.name}</div>
                </Tippy>
            </components.Option>
        ),
        [],
    );
    const customStyles = {
        container: provided => ({
            ...provided,
            flexBasis: '100px',
            padding: '0',
            border: '0',
            fontSize: '0.875rem',
        }),
        control: provided => ({
            ...provided,
            height: '100% !important',
            minHeight: 'calc(1.5em + 0.5rem + 2px)',
            borderTopLeftRadius: props.disableBorderRadiusLeft ? 0 : undefined,
            borderBottomLeftRadius: props.disableBorderRadiusLeft ? 0 : undefined,
            borderTopRightRadius: props.disableBorderRadiusRight ? 0 : undefined,
            borderBottomRightRadius: props.disableBorderRadiusRight ? 0 : undefined,
            ...(props.disableBorderRadiusRight ? { borderRight: 0 } : {}),
            backgroundColor: theme.light,
            color: theme.secondaryDarker,
        }),
        valueContainer: provided => ({
            ...provided,
            marginTop: '0',
            marginLeft: '6px',
            padding: '0',
            border: '0',
        }),
        input: provided => ({
            ...provided,
            color: theme.secondaryDarker,
        }),
        dropdownIndicator: provided => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px',
        }),
        clearIndicator: provided => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px',
        }),
        indicatorsContainer: provided => ({
            ...provided,
            paddingRight: '4px',
            border: '0',
        }),
        menu: provided => ({
            ...provided,
            fontSize: '0.875rem',
        }),
    };

    // lists are not supported when changes are not synced with the backend
    const availableDataTypes = !props.syncBackend ? DATA_TYPES.filter(dataType => dataType.type !== 'list') : DATA_TYPES;

    return (
        <>
            <ConditionalWrapper
                condition={props.isDisabled}
                wrapper={children => (
                    <Tippy
                        interactive
                        content={
                            <TypeTooltipContent
                                switchEntityType={props.entity && DATA_TYPES.filter(dt => dt._class === props.entity).length <= 1}
                                entity={getConfigByType(props.valueType)._class}
                                valueClass={props.valueClass}
                            />
                        }
                    >
                        <span>{children}</span>
                    </Tippy>
                )}
            >
                <Select
                    styles={customStyles}
                    classNamePrefix="react-select-dark"
                    value={getConfigByType(props.valueType)}
                    components={{ Option: CustomOption }}
                    options={!props.entity ? availableDataTypes : availableDataTypes.filter(dt => dt._class === props.entity)}
                    onChange={v => props.setValueType(v.type)}
                    getOptionValue={({ type }) => type}
                    getOptionLabel={({ name }) => name}
                    isClearable={false}
                    menuPortalTarget={props.menuPortalTarget}
                    inputId="datatypeSelector"
                    isDisabled={props.isDisabled}
                />
            </ConditionalWrapper>
            <SelectGlobalStyle />
        </>
    );
};

DatatypeSelector.propTypes = {
    valueType: PropTypes.string,
    setValueType: PropTypes.func,
    entity: PropTypes.string,
    disableBorderRadiusLeft: PropTypes.bool,
    disableBorderRadiusRight: PropTypes.bool,
    menuPortalTarget: PropTypes.object,
    isDisabled: PropTypes.bool,
    valueClass: PropTypes.object,
    syncBackend: PropTypes.bool.isRequired,
};

DatatypeSelector.defaultProps = {
    disableBorderRadiusLeft: false,
    disableBorderRadiusRight: true,
    menuPortalTarget: null,
    isDisabled: false,
    valueClass: null,
};

export default DatatypeSelector;
