import { useEffect, useState } from 'react';

import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { MISC, PREDICATES } from '@/constants/graphSettings';
import { getContributorInformationById } from '@/services/backend/contributors';
import { getObservatoryById } from '@/services/backend/observatories';
import { getOrganization } from '@/services/backend/organizations';
import { getStatements } from '@/services/backend/statements';

function useProvenance() {
    const { resourceId } = useParams();
    const { paper } = useViewPaper({ paperId: resourceId });
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);
    const [observatoryInfo, setObservatoryInfo] = useState(null);
    const [organizationInfo, setOrganizationInfo] = useState(null);
    const [createdBy, setCreatedBy] = useState(null);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        const loadProvenance = () => {
            setIsLoadingProvenance(true);
            const observatoryCall =
                paper?.observatories?.[0] !== MISC.UNKNOWN_ID
                    ? getObservatoryById(paper.observatories?.[0]).catch(() => null)
                    : Promise.resolve(null);

            const organizationCall =
                paper?.organizations?.[0] !== MISC.UNKNOWN_ID ? getOrganization(paper.organizations?.[0]).catch(() => null) : Promise.resolve(null);

            Promise.all([observatoryCall, organizationCall])
                .then(([observatory, organization]) => {
                    setObservatoryInfo(observatory);
                    setOrganizationInfo(organization);
                    setIsLoadingProvenance(false);
                })
                .catch(() => setIsLoadingProvenance(false));
        };

        const loadCreator = () => {
            if (paper?.created_by && paper?.created_by !== MISC.UNKNOWN_ID) {
                getContributorInformationById(paper.created_by)
                    .then((creator) => {
                        setCreatedBy(creator);
                    })
                    .catch(() => setCreatedBy(null));
            } else {
                setCreatedBy(null);
            }
        };

        const loadVersions = (resourceId, list) => {
            getStatements({ subjectId: resourceId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION })
                .then((response) => {
                    if (response.length > 0) {
                        getContributorInformationById(response[0].object.created_by).then((user) => {
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
        loadVersions(paper?.id, []);
    }, [paper?.created_by, paper?.id, paper?.observatories, paper?.organizations]);

    return {
        viewPaper: paper,
        isLoadingProvenance,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
    };
}
export default useProvenance;
