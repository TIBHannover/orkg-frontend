import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toInteger } from 'lodash';
import { FC } from 'react';
import { OptionProps, components } from 'react-select';
import ReactStringReplace from 'react-string-replace';
import { RosettaStoneTemplate } from 'services/backend/types';

const SelectOption: FC<OptionProps<RosettaStoneTemplate, false>> = ({ children, data, ...props }) => {
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
                {!data.__isNew__ && (
                    <Tippy appendTo={document.body} interactive content={<div className="text-start">{data.description}</div>}>
                        <span>
                            <Icon icon={faInfoCircle} />
                        </span>
                    </Tippy>
                )}
            </div>
        </components.Option>
    );
};

export default SelectOption;
