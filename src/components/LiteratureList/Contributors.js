import UserAvatar from 'components/UserAvatar/UserAvatar';
import React from 'react';
import { useSelector } from 'react-redux';

const Contributors = () => {
    const contributors = useSelector(state => state.literatureList.contributors);

    return (
        <div className="d-flex mb-4 flex-wrap">
            {contributors &&
                contributors.map(({ id, percentage }) => (
                    <div className="me-1" key={id}>
                        <UserAvatar
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

export default Contributors;
