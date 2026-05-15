import { faExternalLink, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import { truncate } from 'lodash';
import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';

import { Ontology } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { MAXIMUM_DESCRIPTION_LENGTH } from '@/constants/autocompleteSources';

export const CustomOption = <OptionT extends Ontology, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: OptionProps<OptionT, IsMulti, Group>,
) => {
    const { innerProps, ...propsWithoutInnerProps } = props;
    const { data, children, isFocused, isSelected } = props;
    const { onClick, ...newInnerProps } = innerProps;
    const truncatedDescription = truncate(data.description ? data.description : '', { length: MAXIMUM_DESCRIPTION_LENGTH });
    const iconClassName = !isFocused ? 'text-muted' : 'text-secondary';
    const textClassName = !isFocused && !isSelected ? 'text-muted' : '';

    return (
        <components.Option {...propsWithoutInnerProps} innerProps={newInnerProps}>
            <div className="flex justify-between items-center">
                <div className="grow flex px-2 py-1 flex-col" role="button" tabIndex={0} onKeyDown={undefined} onClick={onClick}>
                    <div>{children}</div>
                    <span>{truncatedDescription && <div className={`text-sm ${textClassName}`}>{truncatedDescription}</div>}</span>
                </div>

                {data.description && data.description !== truncatedDescription && (
                    <Tooltip content={data.description}>
                        <span>
                            <FontAwesomeIcon icon={faInfoCircle} className={iconClassName} />
                        </span>
                    </Tooltip>
                )}

                <a href={data.uri} target="_blank" rel="noreferrer" className="ml-1 shrink-0">
                    <Chip size="sm" variant="soft">
                        {data.shortLabel} <FontAwesomeIcon icon={faExternalLink} size="xs" className="ml-1 text-dark" />
                    </Chip>
                </a>
            </div>
        </components.Option>
    );
};

export default CustomOption;
