import React from 'react';
import { Collapse, Input } from 'reactstrap';
import { StyledStatementItem, StyledListGroupOpen } from 'components/AddPaper/Contributions/styled';
import classNames from 'classnames';
import moment from 'moment';
import { range } from 'utils';
import { resourcesUrl } from 'network';
import AuthorsInput from '../../Utils/AuthorsInput';
import AutoComplete from '../../Utils/AutoComplete';
import PropTypes from 'prop-types';

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

    if (props.type === 'text') {
        input = <Input value={props.value ? props.value : ''} onChange={props.onChange} />;
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
    } else if (props.type === 'authors') {
        input = <AuthorsInput value={props.value} handler={props.onChange} />;
    } else if (props.type === 'publishedIn') {
        input = (
            <AutoComplete
                allowCreate
                requestUrl={resourcesUrl}
                optionsClass={process.env.REACT_APP_CLASSES_VENUE}
                onItemSelected={props.onChange}
                placeholder={'Select or type to enter a venue'}
                autoFocus
                cacheOptions
                value={props.value ? props.value : null}
                isClearable={true}
            />
        );
    }

    return (
        <>
            <StyledStatementItem className={listGroupClass} onClick={props.toggleItem}>
                {props.label}
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
    type: PropTypes.oneOf(['text', 'month', 'year', 'authors', 'publishedIn']).isRequired,
    isLastItem: PropTypes.bool
};

EditItem.defaultProps = {
    isLastItem: false,
    value: ''
};

export default EditItem;
