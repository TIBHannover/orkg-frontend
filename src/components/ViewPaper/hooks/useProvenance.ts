import { useEffect, useState } from 'react';
import useSWR from 'swr';

import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { MISC, PREDICATES } from '@/constants/graphSettings';
import { contributorsUrl, getContributorById } from '@/services/backend/contributors';
import { observatoriesUrl } from '@/services/backend/observatories';
import { organizationsUrl } from '@/services/backend/organizations';
import { getStatements } from '@/services/backend/statements';
import { Contributor, Resource } from '@/services/backend/types';

function useProvenance() {
    const { resourceId } = useParams();
    const { paper } = useViewPaper({ paperId: resourceId });

    const [versions, setVersions] = useState<{ created_at: string; created_by: Contributor; publishedResource: Resource }[]>([]);

    const { data: observatoryInfo, isLoading: isLoadingObservatory } = useSWR(
        paper?.observatories?.[0] !== MISC.UNKNOWN_ID ? [paper?.observatories?.[0], observatoriesUrl, 'getObservatoryById'] : null,
    );

    const { data: organizationInfo, isLoading: isLoadingOrganization } = useSWR(
        paper?.organizations?.[0] !== MISC.UNKNOWN_ID ? [paper?.organizations?.[0], organizationsUrl, 'getOrganization'] : null,
    );

    const isLoadingProvenance = isLoadingObservatory || isLoadingOrganization;

    const { data: createdBy, isLoading: isLoadingCreatedBy } = useSWR(
        paper?.created_by !== MISC.UNKNOWN_ID ? [paper?.created_by, contributorsUrl, 'getContributorById'] : null,
    );

    useEffect(() => {
        const loadVersions = (_resourceId: string, list: { created_at: string; created_by: Contributor; publishedResource: Resource }[]) => {
            getStatements({ subjectId: _resourceId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION })
                .then((response) => {
                    if (response.length > 0) {
                        const publishedResource = response[0].object as Resource;
                        getContributorById(publishedResource.created_by).then((user) => {
                            list.push({ created_at: publishedResource.created_at, created_by: user, publishedResource });
                        });
                        loadVersions(publishedResource.id, list);
                    } else {
                        setVersions(list);
                    }
                })
                .catch(() => setVersions([]));
        };
        if (paper?.id) {
            loadVersions(paper.id, []);
        }
    }, [paper?.id]);

    return {
        isLoadingProvenance,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
    };
}
export default useProvenance;
