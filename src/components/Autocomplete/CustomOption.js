import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTags, faArrowRight, faSpinner, faStar, faClipboard, faExternalLink } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { components } from 'react-select';
import styled from 'styled-components';
import { truncate } from 'lodash';
import { getLinkByEntityType } from 'utils';
import { PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { getStatementsBySubject } from 'services/backend/statements';
import pluralize from 'pluralize';
import { Button } from 'reactstrap';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';

const StyledSelectOption = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    .badge {
        background-color: #ebecf0;
        border-radius: 2em;
        color: #172b4d;
        display: inline-block;
        font-size: 12;
        font-weight: normal;
        line-height: '1';
        min-width: 1;
        padding: 0.16666666666667em 0.5em;
        text-align: center;
    }

    .info {
        display: inline-block;
        font-weight: normal;
        line-height: '1';
        min-width: 1;
        text-align: center;
        cursor: default;
    }
`;

const StyledLabel = styled.span`
    padding: 8px 12px;
    flex: 1;
`;

const MAXIMUM_DESCRIPTION_LENGTH = 120;

export default function CustomOption(props) {
    const { innerProps, ...propsWithoutInnerProps } = props;
    const { onClick, ...newInnerProps } = innerProps;
    const truncatedDescription = truncate(props.data.description ? props.data.description : '', { length: MAXIMUM_DESCRIPTION_LENGTH });
    const [statements, setStatements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const onTrigger = () => {
        if (!isLoaded && props.data.id) {
            setIsLoading(true);
            getStatementsBySubject({ id: props.data.id })
                .then(result => {
                    setStatements(result);
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    return (
        <components.Option {...propsWithoutInnerProps} innerProps={newInnerProps}>
            <StyledSelectOption>
                <StyledLabel onClick={onClick}>
                    {props.children}{' '}
                    {props.data.isRecommended && (
                        <span style={{ color: '#E8AD15' }}>
                            <Icon icon={faStar} /> Recommended
                        </span>
                    )}
                    {truncatedDescription && (
                        <div>
                            <small className={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? 'text-muted' : undefined}>
                                {truncatedDescription}
                            </small>
                        </div>
                    )}
                    <div>
                        {props.data.shared > 0 && (
                            <span>
                                <small>
                                    <Icon
                                        icon={faArrowRight}
                                        color={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? '#dbdde5' : '#80869b'}
                                    />
                                </small>{' '}
                                <i>
                                    <small
                                        className={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? 'text-muted' : undefined}
                                    >
                                        {` Referred: ${pluralize('time', props.data.shared, true)}`}
                                    </small>
                                </i>
                            </span>
                        )}
                        {props.data.classes?.length > 0 && (
                            <span>
                                <small>
                                    {' '}
                                    <Icon
                                        icon={faTags}
                                        color={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? '#dbdde5' : '#80869b'}
                                    />{' '}
                                    {' Instance of: '}
                                </small>
                                <i>
                                    <small
                                        className={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? 'text-muted' : undefined}
                                    >
                                        {props.data.classes.join(', ')}
                                    </small>
                                </i>
                            </span>
                        )}
                    </div>
                </StyledLabel>
                <span>
                    {props.data.tooltipData && props.data.tooltipData.length > 0 && (
                        <div className="info me-1">
                            <Tippy
                                interactive={true}
                                key="c"
                                content={
                                    <div className="text-start">
                                        {props.data.tooltipData &&
                                            props.data.tooltipData.length > 0 &&
                                            props.data.tooltipData.map((info, index) => (
                                                <div key={`s${index}`}>
                                                    <b>{info.property} : </b> {info.value}
                                                </div>
                                            ))}
                                        {props.data.statements &&
                                            props.data.statements
                                                .filter(
                                                    statement =>
                                                        statement.predicate.id === PREDICATES.URL || statement.predicate.id === PREDICATES.SAME_AS,
                                                )
                                                .map((statement, index) => (
                                                    <div key={`s${index}`}>
                                                        <b>{statement.predicate?.label ?? 'URL'} : </b>{' '}
                                                        <a target="_blank" rel="noopener noreferrer" href={statement.value.label}>
                                                            {statement.value.label}
                                                        </a>
                                                    </div>
                                                ))}
                                        {truncatedDescription && props.data.description.length > MAXIMUM_DESCRIPTION_LENGTH && props.data.description}
                                    </div>
                                }
                            >
                                <span>
                                    <Icon icon={faInfoCircle} />
                                </span>
                            </Tippy>
                        </div>
                    )}
                    {!props.data.tooltipData && !props.data.__isNew__ && (
                        <div className="info me-1">
                            <Tippy
                                appendTo={document.body}
                                onTrigger={onTrigger}
                                interactive={true}
                                key="c"
                                content={
                                    <div className="text-start">
                                        {!isLoading ? (
                                            <>
                                                {statements?.length > 0 && (
                                                    <>
                                                        Statements:
                                                        <ul className="px-3 mb-0">
                                                            {statements.slice(0, 5).map(s => (
                                                                <li key={s.id}>
                                                                    {s.predicate.label}:{' '}
                                                                    {truncate(s.object.label ? s.object.label : '', {
                                                                        length: MAXIMUM_DESCRIPTION_LENGTH,
                                                                    })}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {statements?.length > 5 && <div className="px-2">+ {statements?.length - 5} more</div>}
                                                    </>
                                                )}
                                                {statements?.length === 0 && (
                                                    <small>
                                                        <i>No information for this option</i>
                                                    </small>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Icon icon={faSpinner} spin /> Preview of statements
                                            </>
                                        )}
                                    </div>
                                }
                            >
                                <span>
                                    <Icon
                                        icon={faInfoCircle}
                                        color={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? '#dbdde5' : '#80869b'}
                                    />
                                </span>
                            </Tippy>
                        </div>
                    )}
                    <ConditionalWrapper
                        condition={props.data.id}
                        wrapper={children => (
                            <Tippy
                                interactive
                                appendTo={document.body}
                                content={
                                    <div className="d-flex align-items-center text-break">
                                        {props.data.id}
                                        <CopyToClipboard
                                            text={props.data.id}
                                            onCopy={() => {
                                                toast.dismiss();
                                                toast.success('ID copied to clipboard');
                                            }}
                                        >
                                            <Button className="py-0 border border-light-darker px-2 ms-2" size="sm" color="light">
                                                <Icon icon={faClipboard} color="#6c757d" size="xs" />
                                            </Button>
                                        </CopyToClipboard>
                                    </div>
                                }
                            >
                                {children}
                            </Tippy>
                        )}
                    >
                        <a
                            href={props.data.ontology ? props.data.uri : getLinkByEntityType(props.data._class, props.data.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="badge"
                        >
                            {props.data.ontology ?? 'ORKG'} <Icon icon={faExternalLink} color="#6c757d" size="xs" />
                        </a>
                    </ConditionalWrapper>
                </span>
            </StyledSelectOption>
        </components.Option>
    );
}

CustomOption.propTypes = {
    children: PropTypes.node.isRequired,
    data: PropTypes.object.isRequired,
    innerProps: PropTypes.object.isRequired,
};
