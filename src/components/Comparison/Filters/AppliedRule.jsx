import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { Badge, Button } from 'reactstrap';
import styled from 'styled-components';

import { stringifyType } from '@/components/Comparison/Filters/helpers';

const DeleteButton = styled(Button)`
    &&& {
        color: ${(props) => props.theme.secondary};
        padding: 0;
        line-height: 1;
        border: 0;
        &:hover,
        &.active {
            color: red;
        }
    }
`;

const AppliedRule = (props) => {
    const { data } = props;
    const { propertyName, type, value, removeRule } = data;

    return (
        <Badge color="light" className="me-2 mt-2 text-start" style={{ whiteSpace: 'normal' }}>
            <span className="font-weight-bolder">{propertyName}</span>&nbsp;
            <span className="font-italic">{stringifyType(type)}</span>
            &nbsp;
            {value.toString()}
            <DeleteButton color="link" className="ms-2">
                <FontAwesomeIcon icon={faTimes} onClick={removeRule} />
            </DeleteButton>
        </Badge>
    );
};

AppliedRule.propTypes = {
    data: PropTypes.object.isRequired,
};

export default AppliedRule;
