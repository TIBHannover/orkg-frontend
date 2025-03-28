import { Dispatch, FC, ReactElement, SetStateAction } from 'react';
import Select from 'react-select';

import { customClassNames, customStyles, SelectGlobalStyle } from '@/components/Autocomplete/styled';
import DatatypeOption from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeOption';
import DisabledTooltipContent from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DisabledTooltipContent';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import DATA_TYPES, { getConfigByType } from '@/constants/DataTypes';
import { Node } from '@/services/backend/types';

type DatatypeSelectorProps = {
    range?: Node;
    _class?: string;
    dataType: string;
    setDataType: Dispatch<SetStateAction<string>>;
    isDisabled?: boolean;
    menuPortalTarget?: HTMLElement | null;
};

const DatatypeSelector: FC<DatatypeSelectorProps> = ({ range, _class, dataType, setDataType, menuPortalTarget, isDisabled = false }) => {
    const disabledWrapper = (children: ReactElement) => (
        <Tooltip
            content={
                <DisabledTooltipContent
                    _class={getConfigByType(dataType)._class}
                    range={range}
                    canSwitchEntityType={!!(_class && DATA_TYPES.filter((dt) => dt._class === _class).length <= 1)}
                />
            }
        >
            <span className="d-flex flex-shrink-0">{children}</span>
        </Tooltip>
    );

    return (
        <>
            <ConditionalWrapper condition={isDisabled} wrapper={disabledWrapper}>
                <Select
                    value={getConfigByType(dataType)}
                    isMulti={false}
                    components={{ Option: DatatypeOption }}
                    options={!_class ? DATA_TYPES : DATA_TYPES.filter((dt) => dt._class === _class)}
                    onChange={(v) => {
                        if (v && 'type' in v) {
                            setDataType(v?.type ?? '');
                        }
                    }}
                    getOptionValue={({ type }) => type}
                    getOptionLabel={({ name }) => name}
                    isClearable={false}
                    menuPortalTarget={menuPortalTarget ?? null}
                    inputId="datatypeSelector"
                    isDisabled={isDisabled}
                    // @ts-expect-error
                    styles={customStyles}
                    size="sm"
                    noFormControl
                    classNames={{
                        ...customClassNames,
                        container: () => `${customClassNames.container({ selectProps: { noFormControl: true, size: 'sm' } })} flex-shrink-0`,
                    }}
                    classNamePrefix="react-select-dark"
                />
            </ConditionalWrapper>
            <SelectGlobalStyle />
        </>
    );
};

export default DatatypeSelector;
