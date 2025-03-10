import { faClose, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { StyledDotGravatar } from 'components/styled';
import { FC, useState } from 'react';

const PERCENTAGE_THRESHOLD = 3;

type ContributorsProps = {
    contributors: { id: string; percentage: number }[];
};

const Contributors: FC<ContributorsProps> = ({ contributors = [] }) => {
    const [shouldShowAll, setShouldShowAll] = useState(false);
    return (
        <div className="d-flex mb-4 flex-wrap">
            {contributors &&
                contributors
                    .filter(({ percentage }) => (!shouldShowAll ? percentage > PERCENTAGE_THRESHOLD : true))
                    .map(({ id, percentage }) => (
                        <div className="me-1" key={id}>
                            <UserAvatar
                                userId={id}
                                size={40}
                                appendToTooltip={
                                    percentage > 0 ? ` (contributed ~${percentage}% to the content)` : ' (contributed less than 1% to the content)'
                                }
                            />
                        </div>
                    ))}

            {contributors && contributors.find(({ percentage }) => percentage <= PERCENTAGE_THRESHOLD) && (
                <Tooltip content={`${shouldShowAll ? 'Hide' : 'Show'} contributors that contributed less than ${PERCENTAGE_THRESHOLD}%`}>
                    <StyledDotGravatar size={40} onClick={() => setShouldShowAll((v) => !v)} className="rounded-circle">
                        <FontAwesomeIcon icon={shouldShowAll ? faClose : faEllipsisH} />
                    </StyledDotGravatar>
                </Tooltip>
            )}
        </div>
    );
};

export default Contributors;
