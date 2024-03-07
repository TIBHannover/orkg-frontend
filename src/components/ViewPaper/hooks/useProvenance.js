import { MISC, PREDICATES } from 'constants/graphSettings';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getContributorInformationById } from 'services/backend/contributors';
import { getObservatoryById } from 'services/backend/observatories';
import { getOrganization } from 'services/backend/organizations';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';

function useProvenance() {
    const viewPaper = useSelector(state => state.viewPaper.paper);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
    const [observatoryInfo, setObservatoryInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        const loadProvenance = () => {
            setIsLoadingProvenance(true);
            const observatoryCall =
                viewPaper.observatories?.[0] !== MISC.UNKNOWN_ID
                    ? getObservatoryById(viewPaper.observatories?.[0]).catch(() => null)
                    : Promise.resolve(null);

            const organizationCall =
                viewPaper.organizations?.[0] !== MISC.UNKNOWN_ID
                    ? getOrganization(viewPaper.organizations?.[0]).catch(() => null)
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
            if (viewPaper.created_by && viewPaper.created_by !== MISC.UNKNOWN_ID) {
                getContributorInformationById(viewPaper.created_by)
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
        loadVersions(viewPaper.id, []);
    }, [viewPaper.created_by, viewPaper.id, viewPaper.observatories, viewPaper.organizations]);

    return {
        viewPaper,
        isLoadingProvenance,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
    };
}
export default useProvenance;
