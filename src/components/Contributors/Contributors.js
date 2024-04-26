import Tippy from '@tippyjs/react';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { StyledDotGravatar } from 'components/styled';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClose, faEllipsisH } from '@fortawesome/free-solid-svg-icons';

const PERCENTAGE_THRESHOLD = 3;

const Contributors = ({ contributors = [], isEmbedded = false }) => {
    const [shouldShowAll, setShouldShowAll] = useState(false);
    return (
        <div className="d-flex mb-4 flex-wrap">
            {contributors &&
                contributors
                    .filter(({ percentage }) => (!shouldShowAll ? percentage > PERCENTAGE_THRESHOLD : true))
                    .map(({ id, percentage }) => (
                        <div className="me-1" key={id}>
                            <UserAvatar
                                linkTarget={isEmbedded ? '_blank' : undefined}
                                userId={id}
                                size={40}
                                appendToTooltip={
                                    percentage > 0 ? ` (contributed ~${percentage}% to the content)` : ' (contributed less than 1% to the content)'
                                }
                            />
                        </div>
                    ))}

            {contributors && contributors.find(({ percentage }) => percentage <= PERCENTAGE_THRESHOLD) && (
                <Tippy content={`${shouldShowAll ? 'Hide' : 'Show'} contributors that contributed less than ${PERCENTAGE_THRESHOLD}%`}>
                    <StyledDotGravatar size={40} onClick={() => setShouldShowAll((v) => !v)} className="rounded-circle">
                        <Icon icon={shouldShowAll ? faClose : faEllipsisH} />
                    </StyledDotGravatar>
                </Tippy>
            )}
        </div>
    );
};

Contributors.propTypes = {
    contributors: PropTypes.array,
    isEmbedded: PropTypes.bool,
};

export default Contributors;
