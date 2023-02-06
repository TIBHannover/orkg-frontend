import { useState, useEffect } from 'react';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryById } from 'services/backend/observatories';
import { getOrganization } from 'services/backend/organizations';
import { useSelector } from 'react-redux';
import { MISC, PREDICATES } from 'constants/graphSettings';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';

function useProvenance() {
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
    const [observatoryInfo, setObservatoryInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
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

        loadProvenance();
        loadCreator();
        loadVersions(paperResource.id, []);
    }, [paperResource.created_by, paperResource.id, paperResource.observatory_id, paperResource.organization_id]);

    return {
        paperResource,
        isLoadingProvenance,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
    };
}
export default useProvenance;
