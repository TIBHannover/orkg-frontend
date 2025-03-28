import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toInteger } from 'lodash';
import { FC } from 'react';
import { components, OptionProps } from 'react-select';
import ReactStringReplace from 'react-string-replace';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { RosettaStoneTemplate } from '@/services/backend/types';

export type RosettaStoneTemplateOption = RosettaStoneTemplate & { used?: boolean };

const SelectOption: FC<OptionProps<RosettaStoneTemplateOption, false>> = ({ children, data, ...props }) => {
    const replacementFunction = (match: string) => {
        const i = toInteger(match);
        return <i>{data.properties[i].placeholder}</i>;
    };

    const formattedLabelWithPlaceholders = ReactStringReplace(
        data.formatted_label?.replaceAll(']', ' ').replaceAll('[', ' ') ?? '',
        /{(.*?)}/,
        replacementFunction,
    );

    return (
        <components.Option data={data} {...props}>
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <span>{children}</span>
                    <div className="small text-muted">{formattedLabelWithPlaceholders}</div>
                </div>
                {data.used && (
                    <small>
                        <div className="me-2 badge bg-secondary badge-sm p-1">Used</div>
                    </small>
                )}
                {!data.__isNew__ && (
                    <Tooltip content={<div className="text-start">{data.description}</div>}>
                        <span>
                            <FontAwesomeIcon icon={faInfoCircle} />
                        </span>
                    </Tooltip>
                )}
            </div>
        </components.Option>
    );
};

export default SelectOption;
