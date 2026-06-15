'use client';

import {
    faCheck,
    faChevronDown,
    faDownload,
    faRotateRight,
    faSpinner,
    faTriangleExclamation,
    faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, ButtonGroup, Card, Disclosure, Dropdown, Label, ProgressBar, toast } from '@heroui/react';
import type { ExtractionPlan, JobRead, JobStatus } from '@orkg/agentic-loop-client';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import AiComparisonPlanEditor from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonPlanEditor/AiComparisonPlanEditor';
import AiComparisonSection from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonSection/AiComparisonSection';
import AiComparisonStepList from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonStepList/AiComparisonStepList';
import useAiJobStream from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/useAiJobStream';
import AiJobStatusChip from '@/components/AiJobs/AiJobStatusChip/AiJobStatusChip';
import useAiJobActions, { clearActiveAiJobId } from '@/components/AiJobs/hooks/useAiJobActions';
import useAiJobPlan from '@/components/AiJobs/hooks/useAiJobPlan';
import { isJobNotable, mutateAiJobs } from '@/components/AiJobs/hooks/useAiJobs';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Confirm from '@/components/Confirmation/Confirmation';
import { approveAiJobPlan, updateAiJobPlan } from '@/services/agenticLoop/api';

type AiComparisonProgressProps = {
    job: JobRead;
    onDismiss: () => void;
};

const RUNNING_STATUSES: JobStatus[] = ['pending', 'parsing', 'planning', 'executing'];

const AiComparisonProgress = ({ job, onDismiss }: AiComparisonProgressProps) => {
    const stream = useAiJobStream(job.id);

    // `job` is the snapshot from hydration time; once the SSE stream delivers
    // its first event it becomes the live source of truth for all three values.
    const status: JobStatus = stream.status ?? job.status;
    const progressPct = stream.progressPct ?? job.progressPct;
    const progressMessage = stream.progressMessage ?? job.progressMessage;

    const isFailed = status === 'failed';
    const isCompleted = status === 'completed';
    const isAwaitingApproval = status === 'awaiting_approval';
    const isRunning = RUNNING_STATUSES.includes(status);

    const { plan, isLoading: isLoadingPlan, mutate: mutatePlan } = useAiJobPlan(job.id, status);
    const { createComparisonFromJob, downloadCsv, openInCsvImport, cancelJob, isCreatingComparison, isCancelling } = useAiJobActions(job.id);

    const [isSubmittingPlan, setIsSubmittingPlan] = useState(false);
    const [isStepsExpanded, setIsStepsExpanded] = useState(isRunning);

    // Keep the notifications bell and the drafts list in sync as soon as the
    // stream reports a state the user cares about.
    useEffect(() => {
        if (isJobNotable({ ...job, status })) {
            mutateAiJobs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // Expand the step timeline while the pipeline works; tuck it away once the
    // user's attention should be on the plan review or the result actions.
    useEffect(() => {
        setIsStepsExpanded(RUNNING_STATUSES.includes(status));
    }, [status]);

    useEffect(() => {
        if (status === 'cancelled') {
            clearActiveAiJobId(job.id);
            onDismiss();
        }
    }, [status, job.id, onDismiss]);

    // The plan is PUT only when the user actually edited it. Approving flips
    // the job to `executing` on the backend; the UI reacts to that through the
    // SSE status — no local status change happens here.
    const handleExecute = async (editedPlan: ExtractionPlan) => {
        if (!plan) return;
        setIsSubmittingPlan(true);
        try {
            if (!isEqual(plan, editedPlan)) {
                const updateResult = await updateAiJobPlan(job.id, editedPlan);
                if (!updateResult.ok) {
                    toast.danger(updateResult.error);
                    return;
                }
                mutatePlan(updateResult.data.plan, { revalidate: false });
            }

            const approveResult = await approveAiJobPlan(job.id);
            if (!approveResult.ok) {
                toast.danger(approveResult.error);
            }
        } finally {
            setIsSubmittingPlan(false);
        }
    };

    // Terminal states (completed/failed): nothing is running, so just drop the
    // local reference and return to the CTA box.
    const handleDismiss = async () => {
        await clearActiveAiJobId(job.id);
        onDismiss();
    };

    // Cancels the backend job for non-terminal states (running pipeline or a plan
    // awaiting approval) and then returns to the CTA box.
    const cancelAndDismiss = async () => {
        if (await cancelJob()) {
            onDismiss();
        }
    };

    // Used by the running-pipeline cancel button (the plan editor shows its own
    // confirmation dialog already).
    const handleCancelRunningJob = async () => {
        const confirmed = await Confirm({
            title: 'Cancel comparison creation?',
            message: 'The running job will be stopped and cannot be resumed. You will have to start over from the beginning.',
            proceedLabel: 'Cancel creation',
            cancelLabel: 'Keep running',
        });
        if (confirmed) {
            await cancelAndDismiss();
        }
    };

    if (status === 'cancelled') {
        return null;
    }

    // Rendered inside whichever state section is active below, so the card
    // always shows exactly one framed panel with the steps reachable from it.
    const stepsDisclosure = stream.steps.length > 0 && (
        <Disclosure isExpanded={isStepsExpanded} onExpandedChange={setIsStepsExpanded}>
            <Disclosure.Heading>
                <Disclosure.Trigger className="inline-flex items-center gap-1.5 text-sm font-medium">
                    Progress steps
                    <Disclosure.Indicator />
                </Disclosure.Trigger>
            </Disclosure.Heading>
            <Disclosure.Content>
                <Disclosure.Body className="pt-3">
                    <AiComparisonStepList steps={stream.steps} />
                </Disclosure.Body>
            </Disclosure.Content>
        </Disclosure>
    );

    return (
        <Card className="my-3 w-full border-smart/40 border-1">
            <Card.Header className="flex flex-row items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-smart/10 text-smart">
                    <FontAwesomeIcon icon={faWandMagicSparkles} size="lg" />
                </div>
                <div className="min-w-0 flex-1">
                    <Card.Title>AI comparison creator</Card.Title>
                    <Card.Description className="truncate">{plan?.title ?? `Started ${dayjs(job.createdAt).fromNow()}`}</Card.Description>
                </div>
                <AiJobStatusChip status={status} size="md" />
            </Card.Header>

            <Card.Content className="flex flex-col gap-4">
                {isRunning && (
                    <AiComparisonSection
                        icon={faWandMagicSparkles}
                        title="Generating the comparison"
                        description="This might take up to 10 minutes. You can leave this page and the notification bell in the header will let you know when it is done."
                    >
                        <ProgressBar
                            aria-label="Comparison generation progress"
                            className="w-full"
                            color="accent"
                            value={progressPct ?? 0}
                            isIndeterminate={!progressPct}
                        >
                            <Label className="text-sm text-muted">{progressMessage ?? 'Initializing...'}</Label>
                            {!!progressPct && <ProgressBar.Output className="text-sm" />}
                            <ProgressBar.Track>
                                <ProgressBar.Fill />
                            </ProgressBar.Track>
                        </ProgressBar>
                        {stepsDisclosure}
                    </AiComparisonSection>
                )}

                {isCompleted && (
                    <AiComparisonSection
                        icon={faCheck}
                        title="Comparison data ready"
                        description="The comparison data was extracted successfully. Create the comparison directly, or refine the data in the CSV import tool first."
                    >
                        {stepsDisclosure}
                    </AiComparisonSection>
                )}

                {isFailed && (
                    <AiComparisonSection
                        status="danger"
                        icon={faTriangleExclamation}
                        title="Something went wrong while generating the comparison"
                        description={job.error ?? progressMessage ?? stream.error ?? undefined}
                    >
                        {stepsDisclosure}
                    </AiComparisonSection>
                )}

                {isAwaitingApproval && (
                    <AiComparisonSection
                        icon={faWandMagicSparkles}
                        title="Review the extraction plan"
                        description="Check and refine what the AI will extract from your papers before it builds the comparison table."
                    >
                        {stepsDisclosure}
                        {isLoadingPlan && !plan && (
                            <div className="flex items-center gap-2 py-2 text-sm">
                                <FontAwesomeIcon icon={faSpinner} spin />
                                <span>Loading plan...</span>
                            </div>
                        )}
                        {!isLoadingPlan && !plan && (
                            <Alert status="danger">
                                <Alert.Content>
                                    <Alert.Description className="flex items-center justify-between gap-3">
                                        The extraction plan could not be loaded.
                                        <Button size="sm" variant="ghost" onPress={() => mutatePlan()}>
                                            <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                                            Retry
                                        </Button>
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {plan && (
                            <AiComparisonPlanEditor
                                plan={plan}
                                isSubmitting={isSubmittingPlan || isCancelling}
                                onExecute={handleExecute}
                                onCancel={cancelAndDismiss}
                            />
                        )}
                    </AiComparisonSection>
                )}
            </Card.Content>

            {(isRunning || isCompleted || isFailed) && (
                <Card.Footer className="flex justify-end gap-2">
                    {isRunning && (
                        <ButtonWithLoading variant="ghost" isLoading={isCancelling} loadingMessage="Cancelling..." onPress={handleCancelRunningJob}>
                            Cancel
                        </ButtonWithLoading>
                    )}

                    {isCompleted && (
                        <>
                            <Button variant="ghost" isDisabled={isCreatingComparison} onPress={handleDismiss}>
                                Dismiss
                            </Button>
                            <Button variant="ghost" isIconOnly isDisabled={isCreatingComparison} onPress={downloadCsv} aria-label="Download CSV">
                                <FontAwesomeIcon icon={faDownload} />
                            </Button>
                            <ButtonGroup>
                                <ButtonWithLoading
                                    variant="primary"
                                    className="button--orkg-smart"
                                    isLoading={isCreatingComparison}
                                    loadingMessage="Creating..."
                                    onPress={createComparisonFromJob}
                                >
                                    Create comparison
                                </ButtonWithLoading>
                                <Dropdown>
                                    <Button
                                        variant="primary"
                                        isIconOnly
                                        aria-label="More options"
                                        isDisabled={isCreatingComparison}
                                        className="button--orkg-smart"
                                    >
                                        <ButtonGroup.Separator />
                                        <FontAwesomeIcon icon={faChevronDown} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item textValue="Edit in CSV import tool" onPress={openInCsvImport}>
                                                <Label>Edit in CSV import tool</Label>
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </ButtonGroup>
                        </>
                    )}

                    {isFailed && (
                        <Button variant="ghost" onPress={handleDismiss}>
                            Dismiss
                        </Button>
                    )}
                </Card.Footer>
            )}
        </Card>
    );
};

export default AiComparisonProgress;
