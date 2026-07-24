import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@heroui/react';
import { toInteger } from 'lodash';
import { FC } from 'react';
import { components, OptionProps } from 'react-select';
import ReactStringReplace from 'react-string-replace';

import { RosettaStoneTemplate } from '@/services/backend/types';

export type RosettaStoneTemplateOption = RosettaStoneTemplate & { used?: boolean };

const SelectOption: FC<OptionProps<RosettaStoneTemplateOption, false>> = ({ children, data, ...props }) => {
    const replacementFunction = (match: string, index: number) => {
        const i = toInteger(match);
        return <i key={index}>{data.properties[i].placeholder}</i>;
    };

    const formattedLabelWithPlaceholders = ReactStringReplace(
        data.formatted_label?.replaceAll(']', ' ').replaceAll('[', ' ') ?? '',
        /{(.*?)}/,
        replacementFunction,
    );

    return (
        <components.Option data={data} {...props}>
            <div className="flex items-center">
                <div className="grow">
                    <span>{children}</span>
                    <div className="text-sm text-gray-500">{formattedLabelWithPlaceholders}</div>
                </div>
                {data.used && (
                    <small>
                        <div className="mr-2 inline-flex items-center text-xs font-medium rounded bg-secondary badge-sm p-1">Used</div>
                    </small>
                )}
                {!data.__isNew__ && data.description && (
                    <Tooltip>
                        <span className="text-muted">
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </span>
                        <Tooltip.Content className="text-left max-w-xs">{data.description}</Tooltip.Content>
                    </Tooltip>
                )}
            </div>
        </components.Option>
    );
};

export default SelectOption;
