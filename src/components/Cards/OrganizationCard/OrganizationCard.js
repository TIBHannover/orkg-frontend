import Link from 'components/NextJsMigration/Link';
import { Card, CardBody, CardTitle } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { getOrganizationLogoUrl } from 'services/backend/organizations';

const StyledOrganizationCard = styled.div`
    .logoContainer {
        padding: 1rem;
        position: relative;
        display: block;
        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 150px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;
function OrganizationCard(props) {
    return (
        <div className="col-4 mb-3">
            <Link href={reverse(ROUTES.ORGANIZATION, { type: props.type, id: props.organization.display_id })}>
                <StyledOrganizationCard className="card h-100">
                    <Link className="logoContainer" href={reverse(ROUTES.ORGANIZATION, { type: props.type, id: props.organization.display_id })}>
                        <img className="mx-auto p-2" src={getOrganizationLogoUrl(props.organization?.id)} alt={`${props.organization.name} logo`} />
                    </Link>
                    <CardBody>
                        <CardTitle className="text-center">{props.organization.name}</CardTitle>
                    </CardBody>
                </StyledOrganizationCard>
            </Link>
        </div>
    );
}

OrganizationCard.propTypes = {
    organization: PropTypes.object.isRequired,
    route: PropTypes.string,
    type: PropTypes.string,
};

export default OrganizationCard;
