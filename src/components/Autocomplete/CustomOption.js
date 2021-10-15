import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTags, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { components } from 'react-select';
import styled from 'styled-components';
import { truncate } from 'lodash';
import { truncStringPortion } from 'utils';
import { PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { getStatementsBySubject } from 'services/backend/statements';

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
    const truncatedURI = truncStringPortion(props.data.uri ? props.data.uri : '', 15, 50, 3);
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
                    {props.children}
                    {truncatedDescription && (
                        <div>
                            <small className={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? 'text-muted' : undefined}>
                                {truncatedDescription}
                            </small>
                        </div>
                    )}
                    {truncatedURI && (
                        <div>
                            <i>
                                <small className={!propsWithoutInnerProps.isFocused && !propsWithoutInnerProps.isSelected ? 'text-muted' : undefined}>
                                    {truncatedURI}
                                </small>
                            </i>
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
                                        {` Referred: ${props.data.shared} time${props.data.shared > 1 ? 's' : ''}`}
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
                        <div className="info mr-1">
                            <Tippy
                                interactive={true}
                                key="c"
                                content={
                                    <div className="text-left">
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
                                                        statement.predicate.id === PREDICATES.URL || statement.predicate.id === PREDICATES.SAME_AS
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
                        <div className="info mr-1">
                            <Tippy
                                appendTo={document.body}
                                onTrigger={onTrigger}
                                interactive={true}
                                key="c"
                                content={
                                    <div className="text-left">
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
                                                                        length: MAXIMUM_DESCRIPTION_LENGTH
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

                    {props.data.id && (
                        <div onClick={onClick} className="badge" onKeyDown={e => (e.keyCode === 13 ? onClick : undefined)} role="button" tabIndex={0}>
                            {props.data.id}
                        </div>
                    )}
                </span>
            </StyledSelectOption>
        </components.Option>
    );
}

CustomOption.propTypes = {
    children: PropTypes.node.isRequired,
    data: PropTypes.object.isRequired,
    innerProps: PropTypes.object.isRequired
};
