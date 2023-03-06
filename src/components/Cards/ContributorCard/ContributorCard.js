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

function ContributorCard(props) {
    return (
        <div>
            <div className="d-flex flex-row">
                <Link className="justify-content-center align-self-center" to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>
                    <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} md5={props.contributor.gravatar_id} size={50} />
                </Link>
                <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                    <div>
                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>{props.contributor.display_name}</Link>
                    </div>
                    {props.contributor.subTitle && (
                        <div>
                            <small className="text-muted">{props.contributor.subTitle}</small>
                        </div>
                    )}
                    <small>
                        {props.options?.map?.(option => (
                            <StatementActionButton
                                title={option.label}
                                icon={option.icon}
                                key={`contributor-card-${props.contributor.id}-${option.label}`}
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
                    {props.contributor.counts && (
                        <>
                            <br />
                            {props.contributor?.counts && props.contributor.counts.papers !== null && props.contributor.counts.papers !== undefined && (
                                <>
                                    <ul className="list-group list-group-horizontal-md mt-2 d-flex">
                                        <li className="list-group-item p-0 ps-1 pe-2">{pluralize('paper', props.contributor.counts.papers, true)}</li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {pluralize('contribution', props.contributor.counts.contributions, true)}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {pluralize('comparison', props.contributor.counts.comparisons, true)}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2 ">
                                            {pluralize('visualization', props.contributor.counts.visualizations, true)}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {pluralize('research problem', props.contributor.counts.problems, true)}
                                        </li>
                                    </ul>

                                    <div className="p-0 mb-0 mt-2">
                                        <i>
                                            <b>{props.contributor.counts.total} </b>total contributions
                                        </i>
                                    </div>
                                </>
                            )}

                            {props.contributor?.counts &&
                                (props.contributor.counts.papers === null || props.contributor.counts.papers === undefined) &&
                                props.contributor.counts.total !== null && (
                                    <>
                                        <i>{pluralize('contribution', props.contributor.counts.total, true)}</i>
                                    </>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

ContributorCard.propTypes = {
    contributor: PropTypes.object.isRequired,
    options: PropTypes.array,
};

export default ContributorCard;
