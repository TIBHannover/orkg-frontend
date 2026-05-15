import classNames from 'classnames';
import { FC, ReactElement } from 'react';
import Select from 'react-select';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import DatatypeOption from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DatatypeOption';
import DisabledTooltipContent from '@/components/DataBrowser/components/Body/ValueInputField/DatatypeSelector/DisabledTooltipContent';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import DATA_TYPES, { type DataType, getConfigByType } from '@/constants/DataTypes';
import { Node } from '@/services/backend/types';

type DatatypeSelectorProps = {
    range?: Node;
    _class?: string;
    dataType: string;
    setDataType: (_: string) => void;
    isDisabled?: boolean;
    menuPortalTarget?: HTMLElement | undefined;
    allowAllDataTypes?: boolean;
};

const DatatypeSelector: FC<DatatypeSelectorProps> = ({
    range,
    _class,
    dataType,
    setDataType,
    menuPortalTarget,
    isDisabled = false,
    allowAllDataTypes = false,
}) => {
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
            <span className="flex shrink-0">{children}</span>
        </Tooltip>
    );

    return (
        <ConditionalWrapper condition={isDisabled} wrapper={disabledWrapper}>
            <Select<DataType, false>
                value={getConfigByType(dataType)}
                isMulti={false}
                components={{ Option: DatatypeOption }}
                options={!_class || allowAllDataTypes ? DATA_TYPES : DATA_TYPES.filter((dt) => dt._class === _class)}
                onChange={(v) => {
                    if (v && 'type' in v) {
                        setDataType(v?.type ?? '');
                    }
                }}
                getOptionValue={({ type }) => type}
                getOptionLabel={({ name }) => name}
                isClearable={false}
                menuPortalTarget={menuPortalTarget ?? undefined}
                menuPosition="fixed"
                inputId="datatypeSelector"
                isDisabled={isDisabled}
                size="sm"
                noFormControl
                // @ts-expect-error customClassNames is typed for OptionType but works with any option type
                classNames={{
                    ...customClassNames,
                    container: () =>
                        classNames(customClassNames.container?.({ selectProps: { noFormControl: true, size: 'sm' } } as never), 'shrink-0 w-48'),
                    control: (state) =>
                        state.isDisabled
                            ? '!bg-default !border-border !cursor-not-allowed opacity-70 grow overflow-auto rounded-[inherit] !min-h-[inherit]'
                            : (customClassNames.control?.(state as never) ?? ''),
                    singleValue: (state) => classNames('!block !truncate !max-w-full', state.isDisabled ? '!text-muted' : '!text-foreground'),
                }}
                // @ts-expect-error customStyles is typed for OptionType but works with any option type
                styles={customStyles}
                classNamePrefix="react-select"
            />
        </ConditionalWrapper>
    );
};

export default DatatypeSelector;
