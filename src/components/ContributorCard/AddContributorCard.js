import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CustomInput } from 'reactstrap';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
    cursor: pointer;
`;

function AddContributorCard(props) {
    return (
        <div>
            <div className="d-flex">
                <div style={{ marginRight: -10, marginTop: 13 }} className="pr-2">
                    <CustomInput type="checkbox" />
                </div>
                <Link className="float-left" to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>
                    <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} md5={props.contributor.gravatar_id} size={50} />
                </Link>
                <div className="d-flex justify-content-center" style={{ marginLeft: '10px', flexDirection: 'column' }}>
                    <div>
                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.contributor.id })}>{props.contributor.display_name}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

AddContributorCard.propTypes = {
    contributor: PropTypes.object.isRequired
};

export default AddContributorCard;
