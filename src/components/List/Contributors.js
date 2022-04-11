import UserAvatar from 'components/UserAvatar/UserAvatar';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

const Contributors = ({ isEmbedded = false }) => {
    const contributors = useSelector(state => state.list.contributors);

    return (
        <div className="d-flex mb-4 flex-wrap">
            {contributors &&
                contributors.map(({ id, percentage }) => (
                    <div className="me-1" key={id}>
                        <UserAvatar
                            linkTarget={isEmbedded ? '_blank' : undefined}
                            userId={id}
                            size={40}
                            appendToTooltip={
                                percentage > 0 ? ` (contributed ~${percentage}% to this list)` : ' (contributed less than 1% to this list)'
                            }
                        />
                    </div>
                ))}
        </div>
    );
};

Contributors.propTypes = {
    isEmbedded: PropTypes.bool
};

export default Contributors;
