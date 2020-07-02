import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
    cursor: pointer;
`;

function ContributorCard(props) {
    return (
        <div>
            <div className="d-flex">
                <Link className="float-left" to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>
                    <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} email={props.contributor.email} size={50} />
                </Link>
                <div className="d-flex  align-items-center" style={{ marginLeft: '10px' }}>
                    <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>{props.contributor.display_name}</Link>
                </div>
            </div>
        </div>
    );
}

ContributorCard.propTypes = {
    contributor: PropTypes.object.isRequired
};

export default ContributorCard;
