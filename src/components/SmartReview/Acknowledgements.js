import UserAvatar from 'components/UserAvatar/UserAvatar';
import React from 'react';
import { useSelector } from 'react-redux';

const Acknowledgements = () => {
    const contributors = useSelector(state => state.smartReview.contributors);

    return (
        <div className="d-flex mb-4">
            {contributors &&
                contributors.map(contributor => (
                    <div className="mr-1" key={contributor.id}>
                        <UserAvatar userId={contributor.id} size={40} appendToTooltip={` (contributed ${contributor.percentage}% to this article)`} />
                    </div>
                ))}
        </div>
    );
};

export default Acknowledgements;
