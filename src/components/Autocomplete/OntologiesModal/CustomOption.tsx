import { faExternalLink, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { truncate } from 'lodash';
import { useContext } from 'react';
import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';
import { ThemeContext } from 'styled-components';

import { SourceBadge } from '@/components/Autocomplete/styled';
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
    const theme = useContext(ThemeContext);

    const iconColor = !isFocused ? theme?.lightDarker : theme?.secondary;
    const textClassName = !isFocused && !isSelected ? 'text-muted' : '';

    return (
        <components.Option {...propsWithoutInnerProps} innerProps={newInnerProps}>
            <div className="d-flex justify-content-between align-items-center">
                <div className="flex-grow-1 d-flex px-2 py-1 flex-column" role="button" tabIndex={0} onKeyDown={undefined} onClick={onClick}>
                    <div>{children}</div>
                    <span>{truncatedDescription && <div className={`small ${textClassName}`}>{truncatedDescription}</div>}</span>
                </div>

                {data.description && data.description !== truncatedDescription && (
                    <Tooltip content={data.description}>
                        <span>
                            <FontAwesomeIcon icon={faInfoCircle} color={iconColor} />
                        </span>
                    </Tooltip>
                )}

                <SourceBadge href={data.uri} target="_blank" rel="noreferrer" className="ms-1 d-flex align-items-center px-2 py-1">
                    {data.shortLabel} <FontAwesomeIcon icon={faExternalLink} color={theme?.dark} size="xs" className="ms-1" />
                </SourceBadge>
            </div>
        </components.Option>
    );
};

export default CustomOption;
