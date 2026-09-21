import dayjs from 'dayjs';
import { useMemo } from 'react';
import useSWR from 'swr';
import { PublicConfiguration, useSWRConfig } from 'swr/_internal';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { MISC } from '@/constants/graphSettings';
import { CONFERENCE_REVIEW_MISC } from '@/constants/organizationsTypes';
import errorHandler from '@/helpers/errorHandler';
import { comparisonUrl, getComparison, getComparisonContents, updateComparison as updateComparisonBackend } from '@/services/backend/comparisons';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Comparison, ComparisonSelectedPathFlattened, ConferenceSeries, Organization, UpdateAuthor } from '@/services/backend/types';

export const flattenPaths = (items: ComparisonSelectedPathFlattened[], parentPath: string[] = []): ComparisonSelectedPathFlattened[] => {
    let result: ComparisonSelectedPathFlattened[] = [];
    for (const item of items) {
        const currentPath = [...parentPath];
        const newItem = { ...item, path: currentPath };
        result.push(newItem);
        if (item.children && item.children.length > 0) {
            result = result.concat(flattenPaths(item.children, [...currentPath, item.id]));
        }
    }
    return result;
};

const useComparison = (comparisonId?: string, isEmbeddedProp?: boolean) => {
    const { id: contextId, isEmbedded: contextIsEmbedded } = useComparisonState();
    const isEmbedded = isEmbeddedProp ?? contextIsEmbedded;
    const id = comparisonId ?? contextId;

    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const {
        data: comparison,
        isLoading,
        error,
        mutate,
    } = useSWR(id ? [id, comparisonUrl, 'getComparison'] : null, ([params]) => getComparison(params));

    const {
        data: comparisonContents,
        isLoading: isLoadingComparisonContents,
        isValidating: isValidatingComparisonContents,
        error: errorComparisonContents,
        mutate: mutateComparisonContents,
    } = useSWR(id ? [id, comparisonUrl, 'getComparisonContents'] : null, ([params]) => getComparisonContents(params));

    // authors come from edit forms, which produce explicit null ids the representation type forbids
    const updateComparison = (updatedData: Partial<Omit<Comparison, 'authors'>> & { authors?: UpdateAuthor[] }) => {
        if (!comparison) {
            return null;
        }
        return mutate(
            async () => {
                try {
                    await updateComparisonBackend(comparison.id, {
                        ...(updatedData.researchFields && { researchFields: updatedData.researchFields.map((rf) => rf.id) }),
                        ...(updatedData.sdgs && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                        // searchProtocol and visualizations have representation shapes that differ from the
                        // request and are never updated through this path
                        ...(({ researchFields, sdgs, searchProtocol, visualizations, ...o }) => o)(updatedData),
                    });
                } catch (e: unknown) {
                    await errorHandler({ error: e, shouldShowToast: true });
                }
                return { ...comparison, ...updatedData } as Comparison;
            },
            {
                optimisticData: { ...comparison, ...updatedData } as Comparison,
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const isPublished = comparison ? comparison.id !== comparison.versions?.head.id : false;

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

    const isAnonymized = isConferenceDoubleBlind || comparison?.isAnonymized;

    const selectedPathsFlattened = useMemo(() => (comparisonContents ? flattenPaths(comparisonContents.selectedPaths) : []), [comparisonContents]);

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
        comparisonContents,
        isLoadingComparisonContents,
        errorComparisonContents,
        mutateComparisonContents,
        selectedPathsFlattened,
        isValidatingComparisonContents,
        isEditMode: !isEmbedded ? isEditMode : false,
        toggleIsEditMode,
    };
};

export default useComparison;
