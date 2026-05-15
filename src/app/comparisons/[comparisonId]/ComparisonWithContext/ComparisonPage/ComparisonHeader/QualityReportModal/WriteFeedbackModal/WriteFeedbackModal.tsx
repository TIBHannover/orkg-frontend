import { Alert, cn, Modal, toast } from '@heroui/react';
import { FC, useState } from 'react';

import feedbackQuestions from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/hooks/feedbackQuestions';
import InviteResearchersButton from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/InviteResearchersButton/InviteResearchersButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useAuthentication from '@/components/hooks/useAuthentication';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import THING_TYPES from '@/constants/thingTypes';
import { createResource } from '@/services/backend/resources';
import { createResourceStatement } from '@/services/backend/statements';
import { createThing } from '@/services/simcomp';

const LIKERT_SCALE = [
    { value: '-2', label: 'Strongly disagree' },
    { value: '-1', label: 'Disagree' },
    { value: '0', label: 'Neutral' },
    { value: '1', label: 'Agree' },
    { value: '2', label: 'Strongly agree' },
];

type WriteFeedbackModalProps = {
    toggle: () => void;
};

const WriteFeedbackModal: FC<WriteFeedbackModalProps> = ({ toggle }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { comparison, isPublished } = useComparison();
    const { user } = useAuthentication();
    const userId = user ? user.id : null;

    if (!comparison) {
        return null;
    }

    const isOwnComparison = comparison.created_by === userId;
    const isDisabled = isOwnComparison;

    const handleChange = (name: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < feedbackQuestions.length) {
            toast.danger('Please answer all questions');
            return;
        }
        setIsLoading(true);
        const data = { comparisonId: comparison.id, answers };
        try {
            const feedbackResourceId = await createResource({ label: 'feedback', classes: [CLASSES.QUALITY_FEEDBACK] });
            createResourceStatement(comparison.id, PREDICATES.QUALITY_FEEDBACK, feedbackResourceId);
            // @ts-expect-error awaiting migration simcomp
            createThing({ thingType: THING_TYPES.QUALITY_REVIEW, thingKey: feedbackResourceId, data });
            setIsSubmitted(true);
        } catch (e) {
            toast.danger('Something went wrong');
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={(open) => !open && toggle()}>
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Write feedback</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        {!isPublished && (
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>You cannot provide feedback for an unpublished comparison.</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {isPublished && isOwnComparison && (
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>You cannot provide feedback for your own comparison.</Alert.Description>
                                </Alert.Content>
                                <InviteResearchersButton comparisonId={comparison.id} />
                            </Alert>
                        )}
                        {isPublished && !isSubmitted && (
                            <div className={isDisabled ? 'opacity-60' : ''}>
                                {feedbackQuestions.map(({ id, question, input }) => (
                                    <div key={id} className="border-t border-default py-4 first:border-t-0 first:pt-0">
                                        <div className="font-medium text-sm mb-3">{question}</div>
                                        {input === 'likert' && (
                                            <div className="grid grid-cols-5 gap-2">
                                                {LIKERT_SCALE.map((opt) => {
                                                    const isSelected = answers[id] === opt.value;
                                                    return (
                                                        <label
                                                            key={opt.value}
                                                            className={cn(
                                                                'flex flex-col items-center gap-1 text-xs text-center rounded p-2 border transition-colors',
                                                                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-default/40',
                                                                isSelected
                                                                    ? 'border-accent bg-accent/10 font-semibold text-accent'
                                                                    : 'border-default',
                                                            )}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={id.toString()}
                                                                value={opt.value}
                                                                disabled={isDisabled}
                                                                onChange={(e) => handleChange(id.toString(), e.target.value)}
                                                                checked={isSelected}
                                                                aria-label={opt.label}
                                                                className="accent-accent"
                                                            />
                                                            <span>{opt.label}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {input === 'textarea' && (
                                            <textarea
                                                name={id.toString()}
                                                aria-label={question}
                                                disabled={isDisabled}
                                                onChange={(e) => handleChange(id.toString(), e.target.value)}
                                                value={answers[id] ?? ''}
                                                maxLength={MAX_LENGTH_INPUT}
                                                rows={3}
                                                className="w-full rounded border border-default bg-field-background text-field-foreground px-3 py-2 text-sm focus:outline-none focus:border-accent disabled:opacity-60"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSubmitted && (
                            <Alert status="success">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Feedback submitted</Alert.Title>
                                    <Alert.Description>The feedback has been saved successfully. Thank you for your feedback!</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                    </Modal.Body>
                    {isPublished && !isSubmitted && (
                        <Modal.Footer>
                            <ButtonWithLoading variant="primary" onClick={handleSubmit} isLoading={isLoading} isDisabled={isLoading || isDisabled}>
                                Submit
                            </ButtonWithLoading>
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default WriteFeedbackModal;
