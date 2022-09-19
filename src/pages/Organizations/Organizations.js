import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import OrganizationCard from 'components/OrganizationCard/OrganizationCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { getAllOrganizations, getConferences } from 'services/backend/organizations';
import { useParams, Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import TitleBar from 'components/TitleBar/TitleBar';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';
import { ORGANIZATIONS_TYPES } from 'constants/organizationsTypes';
import { MISC } from 'constants/graphSettings';

const Organizations = () => {
    const params = useParams();
    const [organizations, setOrganizations] = useState([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [route, setRoute] = useState('');
    const typeName = ORGANIZATIONS_TYPES.find(t => t.label === params.type).alternateLabel;
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        const loadOrganizations = type => {
            setIsNextPageLoading(true);
            let organizationsList = [];
            if (type === MISC.ORGANIZATION) {
                organizationsList = getAllOrganizations();
                setRoute(ROUTES.ORGANIZATION);
            } else if (type === MISC.CONFERENCE) {
                organizationsList = getConferences();
                setRoute(ROUTES.EVENT);
            }

            Promise.resolve(organizationsList)
                .then(orgs => {
                    if (orgs.length > 0) {
                        setOrganizations(orgs);
                        setIsNextPageLoading(false);
                    } else {
                        setIsNextPageLoading(false);
                    }
                })
                .catch(error => {
                    setIsNextPageLoading(false);
                });
        };
        loadOrganizations(typeName);
        document.title = `${typeName}s - ORKG`;
    }, [typeName]);

    return (
        <>
            <TitleBar
                buttonGroup={
                    !!user &&
                    user.isCurationAllowed && (
                        <RequireAuthentication
                            component={Link}
                            color="secondary"
                            size="sm"
                            className="btn btn-secondary btn-sm flex-shrink-0"
                            to={reverse(ROUTES.ADD_ORGANIZATION, { type: params.type })}
                        >
                            <Icon icon={faPlus} /> Create {typeName}
                        </RequireAuthentication>
                    )
                }
            >
                View all {typeName}s
            </TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5 clearfix">
                {organizations.length > 0 && (
                    <div className="mt-3 row justify-content-center">
                        {organizations.map(organization => (
                            <OrganizationCard key={organization.display_id} organization={{ ...organization }} route={route} type={params.type} />
                        ))}
                    </div>
                )}
                {organizations.length === 0 && !isNextPageLoading && <div className="text-center mt-4 mb-4">No {typeName}s yet</div>}
                {isNextPageLoading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

export default Organizations;
