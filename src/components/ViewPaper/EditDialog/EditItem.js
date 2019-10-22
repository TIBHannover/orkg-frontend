import React from 'react';
import { Collapse, Input } from 'reactstrap';
import { StyledStatementItem, StyledListGroupOpen } from 'components/AddPaper/Contributions/styled';
import classNames from 'classnames';
import moment from 'moment';
import { range } from 'utils';
import AuthorsInput from '../../Utils/AuthorsInput';
import PropTypes from 'prop-types';

const EditItem = (props) => {
    const listGroupClass = classNames({
        statementActive: props.open,
        statementItem: true,
        selectable: true,
        'rounded-bottom': props.isLastItem && !props.open,
    });

    const openBoxClass = classNames({
        listGroupOpenBorderBottom: props.isLastItem,
        'rounded-bottom': props.isLastItem,
    });

    let input;

    if (props.type === 'text') {
        input = <Input value={props.value} onChange={props.onChange} />;
    } else if (props.type === 'month') {
        input = (
            <Input
                type="select"
                value={props.value}
                onChange={props.onChange}
            >
                {moment.months().map((el, index) => {
                    return (
                        <option value={index + 1} key={index + 1}>
                            {el}
                        </option>
                    );
                })}
            </Input>
        );
    } else if (props.type === 'year') {
        input = (
            <Input
                type="select"
                value={props.value}
                onChange={props.onChange}
            >
                {range(1900, moment().year())
                    .reverse()
                    .map((year) => (
                        <option key={year}>{year}</option>
                    ))}
            </Input>
        );
    } else if (props.type === 'authors') {
        input = (
            <AuthorsInput
                value={props.value}
                handler={props.onChange}
            />
        );
    }

    return (
        <>
            <StyledStatementItem className={listGroupClass} onClick={props.toggleItem}>
                {props.label}
            </StyledStatementItem>
            <Collapse isOpen={props.open}>
                <StyledListGroupOpen className={openBoxClass}>
                    {input}
                </StyledListGroupOpen>
            </Collapse>
        </>
    );
}

EditItem.propTypes = {
    open: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    toggleItem: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['text', 'month', 'year', 'authors']).isRequired,
    isLastItem: PropTypes.bool,
}

EditItem.propTypes = {
    isLastItem: false,
}

export default EditItem;