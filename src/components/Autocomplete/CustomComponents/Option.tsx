import { faArrowRight, faCircleExclamation, faClipboard, faExternalLink, faStar, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, toast } from '@heroui/react';
import { truncate } from 'lodash';
import pluralize from 'pluralize';
import { useEffect } from 'react';
import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';
import { useCopyToClipboard } from 'react-use';

import InfoBox from '@/components/Autocomplete/CustomComponents/InfoBox';
import { OptionType } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { getLinkByEntityType } from '@/utils';

const MAXIMUM_DESCRIPTION_LENGTH = 120;

export const Option = <OptionT extends OptionType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
    props: OptionProps<OptionT, IsMulti, Group>,
) => {
    const { innerProps, ...propsWithoutInnerProps } = props;
    const { data, children, isFocused, isSelected } = props;
    const { onClick, ...newInnerProps } = innerProps;
    const truncatedDescription = truncate(data.description ? data.description : '', { length: MAXIMUM_DESCRIPTION_LENGTH });
    const iconClassName = !isFocused ? 'text-muted' : 'text-secondary';
    const textClassName = !isFocused && !isSelected ? 'text-muted' : '';
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('ID copied to clipboard');
        }
    }, [state.value]);

    return (
        <components.Option {...propsWithoutInnerProps} innerProps={newInnerProps}>
            <div className="flex justify-between items-center">
                <div className="grow flex px-2 py-1 flex-col" role="button" tabIndex={0} onKeyDown={undefined} onClick={onClick}>
                    <div>
                        {children}{' '}
                        {data.isRecommended && (
                            <span className="text-warning">
                                <FontAwesomeIcon icon={faStar} /> Recommended
                            </span>
                        )}
                    </div>
                    <div>
                        {truncatedDescription && <div className={`text-sm ${textClassName}`}>{truncatedDescription}</div>}
                        {!data.external && !!data.shared && data.shared > 0 && (
                            <span className="text-sm">
                                <FontAwesomeIcon icon={faArrowRight} className={iconClassName} />{' '}
                                <i className={textClassName}>{` Referred: ${pluralize('time', data.shared, true)}`}</i>
                            </span>
                        )}
                        {!data.external && data.classes && data.classes?.length > 0 && (
                            <span className="text-sm">
                                {' '}
                                <FontAwesomeIcon icon={faTags} className={iconClassName} /> {' Instance of: '}
                                <i className={textClassName}>{data.classes.join(', ')}</i>
                            </span>
                        )}
                    </div>
                </div>
                {!data.__isNew__ && !data.hideLink && (
                    <div className="flex">
                        {(!data.external || (data.tooltipData && data.tooltipData?.length > 0)) && (
                            <div className="inline-block mr-1">
                                <InfoBox data={data} isFocused={isFocused} />
                            </div>
                        )}
                        {/* If the option is a class and it's external and from Wikidata, we need to show a warning badge because it's going to be imported as a class and not a resource */}
                        {data._class && data._class === ENTITIES.CLASS && data.external && data.ontology === 'Wikidata' && (
                            <Tooltip
                                contentStyle={{ zIndex: 99999, position: 'absolute' }}
                                content={<div className="flex items-center break-all z-100">This option will be imported as a class</div>}
                            >
                                <span>
                                    <Chip color="warning" variant="soft" className="text-sm mr-1">
                                        <FontAwesomeIcon icon={faCircleExclamation} color="white" />
                                        {` `}
                                        Class
                                    </Chip>
                                </span>
                            </Tooltip>
                        )}
                        <Tooltip
                            contentStyle={{ zIndex: 99999, position: 'absolute' }}
                            content={
                                <div className="flex items-center break-all z-100">
                                    {data.id}
                                    <button
                                        type="button"
                                        className="py-0 border border-border px-2 ml-2 text-sm bg-transparent hover:bg-default rounded cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            copyToClipboard(data.id);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClipboard} className="text-dark" size="xs" />
                                    </button>
                                </div>
                            }
                            disabled={data.external}
                        >
                            <a
                                href={data.uri && data.ontology ? data.uri : getLinkByEntityType(data?._class ?? '', data.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="shrink-0"
                            >
                                <Chip size="sm" variant="soft">
                                    {data.ontology ?? 'ORKG'} <FontAwesomeIcon icon={faExternalLink} size="xs" className="ml-1 text-dark" />
                                </Chip>
                            </a>
                        </Tooltip>
                    </div>
                )}
            </div>
        </components.Option>
    );
};

export default Option;
