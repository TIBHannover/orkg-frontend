import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.dark};
    cursor: pointer;
`;

const ContributorCard = ({ contributor, showStatsDetails = false, options }) => (
    <div>
        <div className="d-flex flex-row">
            <Link className="justify-content-center align-self-center" to={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} md5={contributor.gravatar_id} size={50} />
            </Link>
            <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                <div>
                    <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>{contributor.display_name}</Link>
                </div>
                {contributor.subTitle && (
                    <div>
                        <small className="text-muted">{contributor.subTitle}</small>
                    </div>
                )}
                <small>
                    {options?.map?.(option => (
                        <StatementActionButton
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
                    <>
                        <br />

                        <ul className="list-group list-group-horizontal-md mt-2 d-flex">
                            <li className="list-group-item p-0 ps-1 pe-2">{pluralize('paper', contributor.papers, true)}</li>
                            <li className="list-group-item p-0 ps-1 pe-2">{pluralize('contribution', contributor.contributions, true)}</li>
                            <li className="list-group-item p-0 ps-1 pe-2">{pluralize('comparison', contributor.comparisons, true)}</li>
                            <li className="list-group-item p-0 ps-1 pe-2 ">{pluralize('visualization', contributor.visualizations, true)}</li>
                            <li className="list-group-item p-0 ps-1 pe-2">{pluralize('research problem', contributor.problems, true)}</li>
                        </ul>

                        <div className="p-0 mb-0 mt-2">{pluralize('total contribution', contributor.total, true)}</div>
                    </>
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
