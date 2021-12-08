import UserAvatar from 'components/UserAvatar/UserAvatar';
import React from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';

const Acknowledgements = () => {
    const contributors = useSelector(state => state.smartReview.contributors);

    return (
        <>
            <div className="d-flex mb-4 flex-wrap">
                {contributors &&
                    contributors.map(({ id, percentage }) => (
                        <div className="me-1" key={id}>
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

            <Alert color="light-darker">
                This review article was created using the{' '}
                <a href="https://doi.org/10.1145/3360901.3364435" target="_blank" rel="noopener noreferrer">
                    Open Research Knowledge Graph
                </a>{' '}
                and the SmartReview methodology
            </Alert>
        </>
    );
};

export default Acknowledgements;
