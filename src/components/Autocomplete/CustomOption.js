import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { components } from 'react-select';
import styled from 'styled-components';
import { truncate } from 'lodash';
import { truncStringPortion } from 'utils';
import { PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

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

    return (
        <components.Option {...propsWithoutInnerProps} innerProps={newInnerProps}>
            <StyledSelectOption>
                <StyledLabel onClick={onClick}>
                    {props.children}
                    {truncatedDescription && (
                        <div>
                            <small className="text-muted">{truncatedDescription}</small>
                        </div>
                    )}
                    {truncatedURI && (
                        <div>
                            <i>
                                <small className="text-muted">{truncatedURI}</small>
                            </i>
                        </div>
                    )}
                </StyledLabel>
                <span>
                    {((truncatedDescription && props.data.description.length > MAXIMUM_DESCRIPTION_LENGTH) ||
                        (props.data.tooltipData && props.data.tooltipData.length > 0)) && (
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
                                                .filter(statement => statement.predicate.id === PREDICATES.URL)
                                                .map((statement, index) => (
                                                    <div key={`s${index}`}>
                                                        <b>URL : </b>{' '}
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
