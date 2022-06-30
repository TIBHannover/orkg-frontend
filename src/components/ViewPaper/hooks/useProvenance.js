import { useState, useEffect } from 'react';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryById } from 'services/backend/observatories';
import { getContributorsByResourceId } from 'services/backend/resources';
import { getOrganization } from 'services/backend/organizations';
import { useSelector } from 'react-redux';
import { MISC, PREDICATES } from 'constants/graphSettings';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { orderBy } from 'lodash';

function useProvenance() {
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
    const [isLoadingContributors, setIsLoadingContributors] = useState(true);
    const [observatoryInfo, setObservatoryInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [contributors, setContributors] = useState([]);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        const loadContributors = () => {
            setIsLoadingContributors(true);
            getContributorsByResourceId(paperResource.id)
                .then(result => {
                    setContributors(result ? result.reverse() : []);
                    setIsLoadingContributors(false);
                })
                .catch(() => {
                    setIsLoadingContributors(false);
                });
        };
        const loadProvenance = () => {
            setIsLoadingProvenance(true);
            const observatoryCall =
                paperResource.observatory_id !== MISC.UNKNOWN_ID
                    ? getObservatoryById(paperResource.observatory_id).catch(() => null)
                    : Promise.resolve(null);

            const organizationCall =
                paperResource.organization_id !== MISC.UNKNOWN_ID
                    ? getOrganization(paperResource.organization_id).catch(() => null)
                    : Promise.resolve(null);

            Promise.all([observatoryCall, organizationCall])
                .then(([observatory, organization]) => {
                    setObservatoryInfo(observatory);
                    setOrganizationInfo(organization);
                    setIsLoadingProvenance(false);
                })
                .catch(() => setIsLoadingProvenance(false));
        };

        const loadCreator = () => {
            if (paperResource.created_by && paperResource.created_by !== MISC.UNKNOWN_ID) {
                getContributorInformationById(paperResource.created_by)
                    .then(creator => {
                        setCreatedBy(creator);
                    })
                    .catch(() => setCreatedBy(null));
            } else {
                setCreatedBy(null);
            }
        };

        const loadVersions = (resourceId, list) => {
            getStatementsBySubjectAndPredicate({ subjectId: resourceId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION })
                .then(response => {
                    if (response.length > 0) {
                        getContributorInformationById(response[0].object.created_by).then(user => {
                            list.push({ created_at: response[0].object.created_at, created_by: user, publishedResource: response[0].object });
                        });
                        loadVersions(response[0].object.id, list);
                    } else {
                        setVersions(list);
                    }
                })
                .catch(() => setVersions(null));
        };

        loadContributors();
        loadProvenance();
        loadCreator();
        loadVersions(paperResource.id, []);
    }, [paperResource.created_by, paperResource.id, paperResource.observatory_id, paperResource.organization_id]);

    return {
        paperResource,
        isLoadingProvenance,
        isLoadingContributors,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions: orderBy([...contributors, ...versions], ['created_at'], ['desc']), // combining contributors and version with DOI information
        contributors,
    };
}
export default useProvenance;
