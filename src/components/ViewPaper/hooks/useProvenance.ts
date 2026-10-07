import useSWR from 'swr';

import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { MISC } from '@/constants/graphSettings';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
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

    // the organizations attribute holds either an organization id or a conference series event id,
    // so fetch both and let the 404 decide which one it is
    const organizationId = paper?.organizations?.[0] !== MISC.UNKNOWN_ID ? paper?.organizations?.[0] : undefined;

    const { data: organization, isLoading: isLoadingOrganization } = useSWR(
        organizationId ? [organizationId, organizationsUrl, 'getOrganization'] : null,
        ([params]) => getOrganization(params),
        { shouldRetryOnError: false },
    );

    const { data: conferenceEvent, isLoading: isLoadingConferenceEvent } = useSWR(
        organizationId ? [organizationId, conferenceSeriesUrl, 'getConferenceById'] : null,
        ([params]) => getConferenceById(params),
        { shouldRetryOnError: false },
    );

    // when assigned to an event, resolve the parent conference so its logo can be shown and the
    // assignment modal opens with the conference preselected
    const { data: parentOrganization } = useSWR(
        conferenceEvent ? [conferenceEvent.organizationId, organizationsUrl, 'getOrganization'] : null,
        ([params]) => getOrganization(params),
    );

    const organizationInfo = organization ?? parentOrganization;

    const isLoadingProvenance = isLoadingObservatory || isLoadingOrganization || isLoadingConferenceEvent;

    const { data: createdBy } = useSWR(
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
        conferenceEvent,
        createdBy,
        versions,
    };
}
export default useProvenance;
