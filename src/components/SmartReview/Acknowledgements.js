import UserAvatar from 'components/UserAvatar/UserAvatar';
import React from 'react';
import { useSelector } from 'react-redux';

const Acknowledgements = () => {
    const contributors = useSelector(state => state.smartReview.contributors);

    return (
        <div className="d-flex mb-4 flex-wrap">
            {contributors &&
                contributors.map(({ id, percentage }) => (
                    <div className="mr-1" key={id}>
                        <UserAvatar
                            userId={id}
                            size={40}
                            appendToTooltip={
                                percentage > 0 ? ` (contributed ~${percentage}% to this article)` : ' (contributed less than 1% to this article)'
                            }
                        />
                    </div>
                ))}
        </div>
    );
};

export default Acknowledgements;
