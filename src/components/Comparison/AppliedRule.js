import React from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Badge } from 'reactstrap';
import PropTypes from 'prop-types';

const AppliedRule = props => {
    const { data } = props;
    const { propertyName, type, value, removeRule } = data;

    const strignifyType = type => {
        if (type === 'oneOf') {
            return 'is One of:';
        } else if (type === 'gte') {
            return '>=';
        } else if (type === 'gteDate') {
            return 'is after:';
        } else if (type === 'lte') {
            return '<=';
        } else if (type === 'nEqDate' || type === 'nEq') {
            return '!=';
        } else if (type === 'lteDate') {
            return 'is before:';
        } else if (type === 'inc') {
            return 'includes one of:';
        }

        return type;
    };
    return (
        <Badge color="lightblue" className="mr-2 mt-2 d-flex align-items-center">
            <span className="font-weight-bolder text-capitalize">{propertyName}</span>&nbsp;
            <span className="font-italic font-weight-bold">{strignifyType(type)}</span>
            &nbsp;
            {value.toString()}
            <Icon icon={faTimes} className="ml-2" style={{ cursor: 'pointer' }} onClick={removeRule} />
        </Badge>
    );
};

AppliedRule.propTypes = {
    data: PropTypes.object.isRequired
};

export default AppliedRule;
