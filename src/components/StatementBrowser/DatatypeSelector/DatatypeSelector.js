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
import ROUTES from 'constants/routes';

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

const DatatypeSelector = ({
    disableBorderRadiusLeft = false,
    disableBorderRadiusRight = true,
    syncBackend,
    entity,
    valueType,
    setValueType,
    valueClass,
    menuPortalTarget = null,
    isDisabled = false,
}) => {
    // const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const theme = useContext(ThemeContext);

    const CustomOption = useCallback(
        (innerProps) => (
            <components.Option {...innerProps}>
                <Tippy content={innerProps.data.tooltip} disabled={!innerProps.data.tooltip}>
                    <div>{innerProps.data.name}</div>
                </Tippy>
            </components.Option>
        ),
        [],
    );
    const customStyles = {
        container: (provided) => ({
            ...provided,
            flexBasis: '100px',
            padding: '0',
            border: '0',
            fontSize: '0.875rem',
        }),
        control: (provided) => ({
            ...provided,
            height: '100% !important',
            minHeight: 'calc(1.5em + 0.5rem + 2px)',
            borderTopLeftRadius: disableBorderRadiusLeft ? 0 : undefined,
            borderBottomLeftRadius: disableBorderRadiusLeft ? 0 : undefined,
            borderTopRightRadius: disableBorderRadiusRight ? 0 : undefined,
            borderBottomRightRadius: disableBorderRadiusRight ? 0 : undefined,
            ...(disableBorderRadiusRight ? { borderRight: 0 } : {}),
            backgroundColor: theme.light,
            color: theme.secondaryDarker,
        }),
        valueContainer: (provided) => ({
            ...provided,
            marginTop: '0',
            marginLeft: '6px',
            padding: '0',
            border: '0',
        }),
        input: (provided) => ({
            ...provided,
            color: theme.secondaryDarker,
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px',
        }),
        clearIndicator: (provided) => ({
            ...provided,
            marginTop: '0',
            padding: '0',
            border: '0',
            width: '16px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            paddingRight: '4px',
            border: '0',
        }),
        menu: (provided) => ({
            ...provided,
            fontSize: '0.875rem',
        }),
    };

    // lists are not supported when changes are not synced with the backend
    const availableDataTypes = !syncBackend ? DATA_TYPES.filter((dataType) => dataType.type !== 'list') : DATA_TYPES;

    return (
        <>
            <ConditionalWrapper
                condition={isDisabled}
                wrapper={(children) => (
                    <Tippy
                        interactive
                        content={
                            <TypeTooltipContent
                                switchEntityType={entity && DATA_TYPES.filter((dt) => dt._class === entity).length <= 1}
                                entity={getConfigByType(valueType)._class}
                                valueClass={valueClass}
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
                    value={getConfigByType(valueType)}
                    components={{ Option: CustomOption }}
                    options={!entity ? availableDataTypes : availableDataTypes.filter((dt) => dt._class === entity)}
                    onChange={(v) => setValueType(v.type)}
                    getOptionValue={({ type }) => type}
                    getOptionLabel={({ name }) => name}
                    isClearable={false}
                    menuPortalTarget={menuPortalTarget}
                    inputId="datatypeSelector"
                    isDisabled={isDisabled}
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

export default DatatypeSelector;
