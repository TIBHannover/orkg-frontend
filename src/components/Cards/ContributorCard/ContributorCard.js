import Link from 'next/link';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import ActionButton from 'components/ActionButton/ActionButton';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${(props) => props.theme.dark};
    cursor: pointer;
`;

const STATS = [
    {
        key: 'comparisons',
        label: 'Comparison',
    },
    {
        key: 'papers',
        label: 'Paper',
    },
    {
        key: 'visualizations',
        label: 'Visualization',
    },
    {
        key: 'problems',
        label: 'Problem',
    },
];

const ContributorCard = ({ contributor, showStatsDetails = false, options }) => (
    <div>
        <div className="d-flex flex-row">
            <Link className="justify-content-center align-self-center" href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} md5={contributor.gravatar_id} size={50} />
            </Link>
            <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                <div>
                    <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>{contributor.display_name}</Link>
                </div>
                {contributor.subTitle && (
                    <div>
                        <small className="text-muted">{contributor.subTitle}</small>
                    </div>
                )}
                <small>
                    {options?.map?.((option) => (
                        <ActionButton
                            title={option.label}
                            icon={option.icon}
                            key={`contributor-card-${contributor.id}-${option.label}`}
                            requireConfirmation={option.requireConfirmation}
                            confirmationMessage="Are you sure?"
                            confirmationButtons={[
                                {
                                    title: 'Delete',
                                    color: 'danger',
                                    icon: faCheck,
                                    action: option.action,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    ))}
                </small>
                {showStatsDetails && (
                    <ul className="list-group list-group-horizontal-md mt-2 d-flex text-center">
                        {STATS.map((stat) => (
                            <li key={stat.key} className="list-group-item p-0 px-3 d-flex flex-column align-items-center">
                                <span className="h5 m-0"> {contributor[stat.key]}</span> <span>{pluralize(stat.label, contributor[stat.key])}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
);

ContributorCard.propTypes = {
    contributor: PropTypes.object.isRequired,
    showStatsDetails: PropTypes.bool,
    options: PropTypes.array,
};

export default ContributorCard;
