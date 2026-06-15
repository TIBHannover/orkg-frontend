'use client';

import { toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { mutateAiJobs } from '@/components/AiJobs/hooks/useAiJobs';
import importPapersFromCsv from '@/components/AiJobs/importPapersFromCsv';
import useMembership from '@/components/hooks/useMembership';
import { AI_COMPARISON_ACTIVE_JOB_ID_KEY } from '@/constants/localStorageKeys';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { reverse } from '@/lib/namedRoute';
import { cancelAiJob, getAiJobPlan, getAiJobResultCsv } from '@/services/agenticLoop/api';
import { createComparison } from '@/services/backend/comparisons';
import { asyncLocalStorage } from '@/utilsTyped';

// Only drop the stored "resume this job" reference when it points at the job we
// acted on — acting on job A from the drafts page must not orphan a running job B.
export const clearActiveAiJobId = async (jobId: string) => {
    const stored = await asyncLocalStorage.getItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY);
    if (stored === jobId) {
        await asyncLocalStorage.removeItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY);
    }
};

const useAiJobActions = (jobId: string) => {
    const router = useRouter();
    const { observatoryId, organizationId } = useMembership();
    const [isCreatingComparison, setIsCreatingComparison] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Turns a completed job into an ORKG comparison: the result CSV is imported
    // as draft papers through the CSV-import machinery, a comparison is created
    // from the resulting contribution ids, and the user lands on it in edit mode.
    const createComparisonFromJob = async () => {
        setIsCreatingComparison(true);
        try {
            // The result CSV and the plan are independent, so fetch them concurrently.
            const [csvContent, planResult] = await Promise.all([getAiJobResultCsv(jobId), getAiJobPlan(jobId)]);
            if (!csvContent.trim()) {
                toast.danger('The result does not contain any papers');
                return;
            }

            const comparisonTitle = (planResult.ok && planResult.data.plan.title) || 'AI generated comparison';
            const comparisonDescription = (planResult.ok && planResult.data.plan.description) || '';

            const { contributionIds } = await importPapersFromCsv(csvContent);

            if (contributionIds.length === 0) {
                toast.danger('No papers could be created, the comparison was not created');
                return;
            }

            const comparisonId = await createComparison({
                title: comparisonTitle,
                description: comparisonDescription,
                research_fields: [],
                authors: [],
                sources: contributionIds.map((id) => ({ id, type: 'THING' })),
                references: [],
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                is_anonymized: false,
            });

            await clearActiveAiJobId(jobId);
            router.push(`${reverse(ROUTES.COMPARISON, { comparisonId })}?isEditMode=true`);
        } catch (error) {
            errorHandler({ error, shouldShowToast: true });
        } finally {
            setIsCreatingComparison(false);
        }
    };

    const downloadCsv = async () => {
        try {
            // The service needs the bearer header, so a plain download link can't be
            // used — fetch the CSV with auth and trigger the download from a Blob.
            const csvContent = await getAiJobResultCsv(jobId);
            const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `comparison-${jobId}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            errorHandler({ error, shouldShowToast: true });
        }
    };

    const openInCsvImport = async () => {
        await clearActiveAiJobId(jobId);
        router.push(`${ROUTES.CSV_IMPORT}?aiJobId=${encodeURIComponent(jobId)}`);
    };

    const cancelJob = async (): Promise<boolean> => {
        setIsCancelling(true);
        try {
            const result = await cancelAiJob(jobId);
            if (!result.ok) {
                toast.danger(result.error);
                return false;
            }
            await clearActiveAiJobId(jobId);
            mutateAiJobs();
            return true;
        } finally {
            setIsCancelling(false);
        }
    };

    return { createComparisonFromJob, downloadCsv, openInCsvImport, cancelJob, isCreatingComparison, isCancelling };
};

export default useAiJobActions;
