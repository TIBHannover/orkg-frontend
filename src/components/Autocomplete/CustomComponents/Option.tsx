import { faArrowRight, faClipboard, faExternalLink, faStar, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { truncate } from 'lodash';
import pluralize from 'pluralize';
import { useContext } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import type { GroupBase } from 'react-select';
import { components, OptionProps } from 'react-select';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { ThemeContext } from 'styled-components';

import InfoBox from '@/components/Autocomplete/CustomComponents/InfoBox';
import { SourceBadge } from '@/components/Autocomplete/styled';
import { OptionType } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { getLinkByEntityType } from '@/utils';

const MAXIMUM_DESCRIPTION_LENGTH = 120;

export const Option = <OptionT extends OptionType, Group extends GroupBase<OptionT>, IsMulti extends boolean = false>(
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
                    <div>
                        {children}{' '}
                        {data.isRecommended && (
                            <span style={{ color: '#E8AD15' }}>
                                <FontAwesomeIcon icon={faStar} /> Recommended
                            </span>
                        )}
                    </div>
                    <div>
                        {truncatedDescription && <div className={`small ${textClassName}`}>{truncatedDescription}</div>}
                        {!data.external && !!data.shared && data.shared > 0 && (
                            <span className="small">
                                <FontAwesomeIcon icon={faArrowRight} color={iconColor} />{' '}
                                <i className={textClassName}>{` Referred: ${pluralize('time', data.shared, true)}`}</i>
                            </span>
                        )}
                        {!data.external && data.classes && data.classes?.length > 0 && (
                            <span className="small">
                                {' '}
                                <FontAwesomeIcon icon={faTags} color={iconColor} /> {' Instance of: '}
                                <i className={textClassName}>{data.classes.join(', ')}</i>
                            </span>
                        )}
                    </div>
                </div>
                {!data.__isNew__ && (
                    <div className="d-flex">
                        {(!data.external || (data.tooltipData && data.tooltipData?.length > 0)) && (
                            <div className="d-inline-block me-1">
                                <InfoBox data={data} isFocused={isFocused} />
                            </div>
                        )}

                        <Tooltip
                            content={
                                <div className="d-flex align-items-center text-break">
                                    {data.id}
                                    <CopyToClipboard
                                        text={data.id}
                                        onCopy={() => {
                                            toast.dismiss();
                                            toast.success('ID copied to clipboard');
                                        }}
                                    >
                                        <Button className="py-0 border border-light-darker px-2 ms-2" size="sm" color="light">
                                            <FontAwesomeIcon icon={faClipboard} color={theme?.dark} size="xs" />
                                        </Button>
                                    </CopyToClipboard>
                                </div>
                            }
                            disabled={data.external}
                        >
                            <SourceBadge
                                href={data.uri && data.ontology ? data.uri : getLinkByEntityType(data?._class ?? '', data.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="d-flex align-items-center px-2 py-1 flex-shrink-0"
                            >
                                {data.ontology ?? 'ORKG'} <FontAwesomeIcon icon={faExternalLink} color={theme?.dark} size="xs" className="ms-1" />
                            </SourceBadge>
                        </Tooltip>
                    </div>
                )}
            </div>
        </components.Option>
    );
};

export default Option;
