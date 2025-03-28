import dayjs from 'dayjs';
import useSWR from 'swr';
import { PublicConfiguration, useSWRConfig } from 'swr/_internal';

import useParams from '@/components/useParams/useParams';
import { MISC } from '@/constants/graphSettings';
import { CONFERENCE_REVIEW_MISC } from '@/constants/organizationsTypes';
import errorHandler from '@/helpers/errorHandler';
import { comparisonUrl, getComparison, updateComparison as updateComparisonBackend } from '@/services/backend/comparisons';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Comparison, ConferenceSeries, Organization } from '@/services/backend/types';

const useComparison = (comparisonId?: string) => {
    let { comparisonId: id } = useParams<{ comparisonId: string }>();
    if (comparisonId) {
        id = comparisonId;
    }

    const {
        data: comparison,
        isLoading,
        error,
        mutate,
    } = useSWR(id ? [id, comparisonUrl, 'getComparison'] : null, ([params]) => getComparison(params));

    const updateComparison = (updatedData: Partial<Comparison>) => {
        if (!comparison) {
            return null;
        }
        return mutate(
            async () => {
                try {
                    await updateComparisonBackend(comparison.id, {
                        ...(updatedData.research_fields && { research_fields: updatedData.research_fields.map((rf) => rf.id) }),
                        ...(updatedData.sdgs && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                        ...(updatedData.contributions && { contributions: updatedData.contributions.map((rf) => rf.id) }),
                        ...(({ research_fields, sdgs, contributions, ...o }) => o)(updatedData),
                    });
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                }
                return { ...comparison, ...updatedData };
            },
            {
                optimisticData: { ...comparison, ...updatedData },
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const isPublished = comparison ? comparison.id !== comparison.versions.head.id : false;

    const { onErrorRetry } = useSWRConfig();

    const { data: organization, mutate: mutateOrganization } = useSWR(
        comparison?.organizations?.[0] && comparison?.organizations?.[0] !== MISC.UNKNOWN_ID
            ? [comparison?.organizations?.[0], organizationsUrl, 'getOrganization']
            : null,
        ([params]) => getOrganization(params),
        {
            // since organizations and conferenceSeries share the same attribute (i.e., comparison?.organizations),
            // a 404 will be returned if either one of them is set. This prevent useSWR from retrying in case there is a 404
            // typing doesn't work nicely when overwriting this setting, see: https://github.com/vercel/swr/discussions/1574#discussioncomment-4982649
            onErrorRetry(err, key, config, revalidate, revalidateOpts) {
                const configForDelegate = config as Readonly<PublicConfiguration<Organization, unknown, (path: string) => unknown>>;
                if (err.status === 404) return;
                onErrorRetry(err, key, configForDelegate, revalidate, revalidateOpts);
            },
        },
    );

    const { data: conferenceSeries } = useSWR(
        comparison?.organizations?.[0] && comparison?.organizations?.[0] !== MISC.UNKNOWN_ID
            ? [comparison?.organizations?.[0], conferenceSeriesUrl, 'getConferenceById']
            : null,
        ([params]) => getConferenceById(params),
        {
            // see comment for organizations
            onErrorRetry(err, key, config, revalidate, revalidateOpts) {
                const configForDelegate = config as Readonly<PublicConfiguration<ConferenceSeries, unknown, (path: string) => unknown>>;
                if (err.status === 404) return;
                onErrorRetry(err, key, configForDelegate, revalidate, revalidateOpts);
            },
        },
    );

    const { data: observatory, mutate: mutateObservatory } = useSWR(
        comparison?.observatories?.[0] && comparison?.observatories?.[0] !== MISC.UNKNOWN_ID
            ? [comparison?.observatories?.[0], observatoriesUrl, 'getObservatoryById']
            : null,
        ([params]) => getObservatoryById(params),
    );

    const isConferenceDoubleBlind =
        conferenceSeries?.metadata.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND &&
        dayjs().format('YYYY-MM-DD') < conferenceSeries?.metadata?.start_date;

    const isAnonymized = isConferenceDoubleBlind || comparison?.is_anonymized;

    return {
        comparison,
        isLoading,
        error,
        mutate,
        updateComparison,
        isPublished,
        organization,
        observatory,
        mutateOrganization,
        mutateObservatory,
        conferenceSeries,
        isAnonymized,
    };
};

export default useComparison;
