'use client';

import type { JobRead } from '@orkg/agentic-loop-client';
import { useQueryState } from 'nuqs';
import { useEffect, useRef, useState } from 'react';

import AiComparisonCreatorCtaBox from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonCreatorCtaBox/AiComparisonCreatorCtaBox';
import AiComparisonCreatorModal from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonCreatorModal/AiComparisonCreatorModal';
import AiComparisonProgress from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonProgress/AiComparisonProgress';
import { AI_COMPARISON_ACTIVE_JOB_ID_KEY } from '@/constants/localStorageKeys';
import { getAiJob } from '@/services/agenticLoop/api';
import { asyncLocalStorage } from '@/utilsTyped';

type AiComparisonCreatorProps = {
    onLoadingChange?: (isLoading: boolean) => void;
};

const AiComparisonCreator = ({ onLoadingChange }: AiComparisonCreatorProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeJob, setActiveJob] = useState<JobRead | null>(null);
    const [isHydrating, setIsHydrating] = useState(true);
    const [aiJobIdParam, setAiJobIdParam] = useQueryState('aiJobId');
    // Tracks the job already loaded so clearing the query param (or re-running
    // the effect) doesn't refetch and flicker the progress UI.
    const hydratedJobIdRef = useRef<string | null>(null);

    useEffect(() => {
        onLoadingChange?.(isHydrating || activeJob !== null);
    }, [isHydrating, activeJob, onLoadingChange]);

    useEffect(() => {
        let cancelled = false;
        const hydrate = async () => {
            // A job opened from the notifications bell or the drafts page
            // (?aiJobId=) wins over the locally stored one.
            const jobId = aiJobIdParam ?? (await asyncLocalStorage.getItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY));
            if (cancelled) return;
            if (!jobId || hydratedJobIdRef.current === jobId) {
                if (aiJobIdParam) setAiJobIdParam(null);
                setIsHydrating(false);
                return;
            }
            const result = await getAiJob(jobId);
            if (cancelled) return;

            if (result.ok && result.data.status !== 'cancelled') {
                hydratedJobIdRef.current = jobId;
                asyncLocalStorage.setItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY, jobId);
                setActiveJob(result.data);
            } else {
                asyncLocalStorage.removeItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY);
            }
            if (aiJobIdParam) setAiJobIdParam(null);
            setIsHydrating(false);
        };
        hydrate();

        return () => {
            cancelled = true;
        };
    }, [aiJobIdParam, setAiJobIdParam]);

    const handleJobCreated = (job: JobRead) => {
        hydratedJobIdRef.current = job.id;
        asyncLocalStorage.setItem(AI_COMPARISON_ACTIVE_JOB_ID_KEY, job.id);
        setActiveJob(job);
        setIsModalOpen(false);
    };

    const handleDismiss = () => {
        hydratedJobIdRef.current = null;
        setActiveJob(null);
    };

    if (isHydrating) {
        return null;
    }

    if (activeJob) {
        return <AiComparisonProgress job={activeJob} onDismiss={handleDismiss} />;
    }

    return (
        <>
            <AiComparisonCreatorCtaBox onOpen={() => setIsModalOpen(true)} />
            <AiComparisonCreatorModal isOpen={isModalOpen} toggle={() => setIsModalOpen((v) => !v)} onJobCreated={handleJobCreated} />
        </>
    );
};

export default AiComparisonCreator;
