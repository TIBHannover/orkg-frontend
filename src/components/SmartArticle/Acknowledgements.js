import UserAvatar from 'components/UserAvatar/UserAvatar';
import React from 'react';
import { useSelector } from 'react-redux';

const Acknowledgements = () => {
    const contributors = useSelector(state => state.smartArticle.contributors);

    return (
        <div className="d-flex mb-4">
            {contributors &&
                contributors.map(contributor => (
                    <div className="mr-1" key={contributor}>
                        <UserAvatar userId={contributor} size="40" />
                    </div>
                ))}
        </div>
    );
};

export default Acknowledgements;
