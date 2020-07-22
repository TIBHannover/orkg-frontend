import React from 'react';
import { Collapse, Input } from 'reactstrap';
import AuthorsInput from 'components/Utils/AuthorsInput';
import AutoComplete from 'components/Utils/AutoComplete';
import { StyledStatementItem, StyledListGroupOpen } from './styled';
import classNames from 'classnames';
import moment from 'moment';
import { range } from 'utils';
import { truncate } from 'lodash';
import { resourcesUrl } from 'network';
import PropTypes from 'prop-types';
import { CLASSES } from 'constants/graphSettings';

const EditItem = props => {
    const listGroupClass = classNames({
        statementActive: props.open,
        statementItem: true,
        selectable: true,
        'rounded-bottom': props.isLastItem && !props.open
    });

    const openBoxClass = classNames({
        listGroupOpenBorderBottom: props.isLastItem,
        'rounded-bottom': props.isLastItem
    });

    let input;
    let stringValue;

    if (props.type === 'text') {
        input = <Input value={props.value ? props.value : ''} onChange={props.onChange} />;
        stringValue = truncate(props.value ? props.value : '', { length: 60 });
    } else if (props.type === 'month') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
                {moment.months().map((el, index) => {
                    return (
                        <option value={index + 1} key={index + 1}>
                            {el}
                        </option>
                    );
                })}
            </Input>
        );
        stringValue = props.value ? moment(props.value, 'M').format('MMMM') : 'Not specified';
    } else if (props.type === 'year') {
        input = (
            <Input type="select" value={props.value} onChange={props.onChange}>
                {range(1900, moment().year())
                    .reverse()
                    .map(year => (
                        <option key={year}>{year}</option>
                    ))}
            </Input>
        );
        stringValue = props.value;
    } else if (props.type === 'authors') {
        input = <AuthorsInput value={props.value} handler={props.onChange} />;
        const authors = props.value.map(author => author.label);
        stringValue = authors.length > 2 ? `${authors.slice(0, 2).join(', ')} et al.` : authors.join(', ');
    } else if (props.type === 'publishedIn') {
        input = (
            <AutoComplete
                allowCreate
                requestUrl={resourcesUrl}
                optionsClass={CLASSES.VENUE}
                onItemSelected={props.onChange}
                placeholder="Select or type to enter a venue"
                autoFocus
                cacheOptions
                value={props.value ? props.value : null}
                isClearable={true}
            />
        );
        stringValue = props.value ? truncate(props.value.label, { length: 60 }) : 'Not specified';
    } else if (props.type === 'researchField') {
        input = (
            <AutoComplete
                allowCreate={false}
                requestUrl={resourcesUrl}
                optionsClass={CLASSES.RESEARCH_FIELD}
                onItemSelected={props.onChange}
                placeholder="Select a research field"
                autoFocus
                cacheOptions
                value={props.value ? props.value : null}
                isClearable={false}
            />
        );
        stringValue = props.value && props.value.label ? props.value.label : 'Not specified';
    }

    return (
        <>
            <StyledStatementItem className={listGroupClass} onClick={props.toggleItem}>
                {props.open ? (
                    props.label
                ) : (
                    <>
                        {props.label} : {stringValue ? <i>{stringValue}</i> : 'Not specified'}
                    </>
                )}
            </StyledStatementItem>
            <Collapse isOpen={props.open}>
                <StyledListGroupOpen className={openBoxClass}>{input}</StyledListGroupOpen>
            </Collapse>
        </>
    );
};

EditItem.propTypes = {
    open: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    toggleItem: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
    onChange: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['text', 'month', 'year', 'authors', 'publishedIn', 'researchField']).isRequired,
    isLastItem: PropTypes.bool
};

EditItem.defaultProps = {
    isLastItem: false,
    value: ''
};

export default EditItem;
