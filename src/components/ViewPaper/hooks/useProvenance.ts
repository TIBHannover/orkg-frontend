import useSWR from 'swr';

import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { MISC } from '@/constants/graphSettings';
import { contributorsUrl, getContributorById } from '@/services/backend/contributors';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Contributor, Resource } from '@/services/backend/types';

function useProvenance() {
    const { resourceId } = useParams();
    const { paper, publishedVersions } = useViewPaper({ paperId: resourceId });

    const { data: observatoryInfo, isLoading: isLoadingObservatory } = useSWR(
        paper?.observatories?.[0] !== MISC.UNKNOWN_ID && paper?.observatories?.[0]
            ? [paper?.observatories?.[0], observatoriesUrl, 'getObservatoryById']
            : null,
        ([params]) => getObservatoryById(params),
    );

    const { data: organizationInfo, isLoading: isLoadingOrganization } = useSWR(
        paper?.organizations?.[0] !== MISC.UNKNOWN_ID && paper?.organizations?.[0]
            ? [paper?.organizations?.[0], organizationsUrl, 'getOrganization']
            : null,
        ([params]) => getOrganization(params),
    );

    const isLoadingProvenance = isLoadingObservatory || isLoadingOrganization;

    const { data: createdBy, isLoading: isLoadingCreatedBy } = useSWR(
        paper?.createdBy !== MISC.UNKNOWN_ID && paper?.createdBy ? [paper?.createdBy, contributorsUrl, 'getContributorById'] : null,
        ([params]) => getContributorById(params),
    );

    // the API delivers the publication history on the head paper (versions.published, latest first)
    const { data: versions = [] } = useSWR(
        publishedVersions.length > 0 ? [publishedVersions, contributorsUrl, 'getContributorById'] : null,
        ([entries]) =>
            Promise.all(
                entries.map(async (entry) => ({
                    created_at: entry.createdAt,
                    created_by: await getContributorById(entry.createdBy).catch(
                        () => ({ id: MISC.UNKNOWN_ID, displayName: 'Unknown' }) as Contributor,
                    ),
                    publishedResource: { id: entry.id, label: entry.label } as Resource,
                })),
            ),
    );

    return {
        isLoadingProvenance,
        observatoryInfo,
        organizationInfo,
        createdBy,
        versions,
    };
}
export default useProvenance;
