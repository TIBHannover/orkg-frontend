import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import capitalize from 'capitalize';
import { ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import { useSelector } from 'react-redux';

const OrganizationBannerStyled = styled.div`
    float: right;
    border: 2px solid ${props => props.theme.light};
    border-radius: 5px;
    display: flex;
    padding: 5px 20px;
    align-items: center;
    max-width: 40%;
    margin: 0 -25px 0 0;
    flex-direction: column;
    font-size: 95%;
    max-width: 200px;
    flex-shrink: 0;

    &:hover {
        border: 2px solid ${props => props.theme.secondary};
    }
`;

const OrganizationBanner = () => {
    const observatory = useSelector(state => state.comparison.observatory ?? null);

    if (!observatory || !observatory.organization) {
        return null;
    }

    const link = observatory.id
        ? reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })
        : reverse(ROUTES.ORGANIZATION, { type: capitalize(ORGANIZATIONS_MISC.GENERAL), id: observatory.organization.display_id });

    return (
        <OrganizationBannerStyled>
            <Link to={link} className="text-center">
                {observatory.organization.logo && (
                    <img
                        className="p-2"
                        src={observatory.organization.logo}
                        alt={`${observatory.organization.name} logo`}
                        style={{ maxWidth: 200, maxHeight: 60 }}
                    />
                )}

                {observatory?.name && <div>{observatory.name}</div>}
            </Link>
        </OrganizationBannerStyled>
    );
};

export default OrganizationBanner;
