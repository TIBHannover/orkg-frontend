import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import PropTypes from 'prop-types';

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
                    {props.contributor.counts && (
                        <>
                            <br />
                            {props.contributor?.counts && props.contributor.counts.papers !== null && props.contributor.counts.papers !== undefined && (
                                <>
                                    <ul class="list-group list-group-horizontal-md mt-2 d-flex">
                                        <li className="list-group-item p-0 ps-1 pe-2">
                                            {props.contributor.counts.papers} paper{props.contributor.counts.papers > 1 ? 's' : ''}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {props.contributor.counts.contributions} contribution
                                            {props.contributor.counts.contributions > 1 ? 's' : ''}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {props.contributor.counts.comparisons} comparison{props.contributor.counts.comparisons > 1 ? 's' : ''}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2 ">
                                            {props.contributor.counts.visualizations} visualization
                                            {props.contributor.counts.visualizations > 1 ? 's' : ''}
                                        </li>
                                        <li className="list-group-item p-0  ps-1 pe-2">
                                            {props.contributor.counts.problems} research problem{props.contributor.counts.problems > 1 ? 's' : ''}
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
                                        <i>{props.contributor.counts.total} contributions</i>
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
    contributor: PropTypes.object.isRequired
};

export default ContributorCard;
