import { CardBadgeFilter } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const ClassBadgeFilter = ({ filter, active, toggle }) => {
    return (
        <CardBadgeFilter className={active ? 'active' : ''} onClick={() => toggle(filter.id)}>
            <span>
                {active && <Icon fixedWidth={true} size="sm" icon={faCheck} className="mr-1" />}
                {filter.label}
            </span>
        </CardBadgeFilter>
    );
};

ClassBadgeFilter.propTypes = {
    filter: PropTypes.object.isRequired,
    active: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default ClassBadgeFilter;
