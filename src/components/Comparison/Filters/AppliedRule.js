import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const RemoveFilterIcon = styled(Icon)`
    cursor: pointer;
    color: ${props => props.theme.darkblue};
    &:hover,
    &.active {
        color: red;
    }
`;

const AppliedRule = props => {
    const { data } = props;
    const { propertyName, type, value, removeRule } = data;

    return (
        <Badge color="lightblue" className="mr-2 mt-2 text-left" style={{ whiteSpace: 'normal' }}>
            <span className="font-weight-bolder">{propertyName}</span>&nbsp;
            <span className="font-italic">{type}</span>
            &nbsp;
            {value.toString()}
            <RemoveFilterIcon icon={faTimes} className="ml-2" onClick={removeRule} />
        </Badge>
    );
};

AppliedRule.propTypes = {
    data: PropTypes.object.isRequired
};

export default AppliedRule;
