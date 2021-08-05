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
            <div className="d-flex">
                <Link className="float-left" to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>
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
                </div>
            </div>
        </div>
    );
}

ContributorCard.propTypes = {
    contributor: PropTypes.object.isRequired
};

export default ContributorCard;
