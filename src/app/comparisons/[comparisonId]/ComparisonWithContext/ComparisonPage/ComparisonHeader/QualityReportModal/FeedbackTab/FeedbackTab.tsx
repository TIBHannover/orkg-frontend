import { Alert } from '@heroui/react';
import { FC } from 'react';

import FEEDBACK_QUESTIONS from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/hooks/feedbackQuestions';
import InviteResearchersButton from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/InviteResearchersButton/InviteResearchersButton';

type FeedbackTabProps = {
    feedbacks: {
        [key: string]: string;
    }[];
    comparisonId: string;
};

const FeedbackTab: FC<FeedbackTabProps> = ({ feedbacks, comparisonId }) => {
    if (!comparisonId) {
        return (
            <div className="m-4">
                <Alert status="danger">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Feedback unavailable</Alert.Title>
                        <Alert.Description>User feedback is not available for unpublished comparisons.</Alert.Description>
                    </Alert.Content>
                </Alert>
            </div>
        );
    }

    const questions = FEEDBACK_QUESTIONS.map((question) => ({
        ...question,
        score:
            question.input === 'likert'
                ? Math.round(feedbacks.reduce((acc, review) => acc + ((parseInt(review[question.id], 10) + 2) / 4) * 100, 0) / feedbacks.length) || 0
                : undefined,
    }));

    return (
        <div className="px-4 pb-4">
            <div className="flex flex-wrap justify-between items-center gap-3 my-6">
                <p className="m-0 text-sm">
                    The displayed results are based on feedback from <strong>{feedbacks.length} different evaluators</strong>
                </p>
                <InviteResearchersButton comparisonId={comparisonId} />
            </div>
            {questions.map((question) => (
                <div key={question.id} className="border-t border-default py-3">
                    <div className="font-medium text-sm mb-3">{question.question}</div>
                    {question.input === 'likert' && (
                        <div className="flex items-center gap-3">
                            <div className="font-semibold text-right w-[20%] text-xs">{question.score}% agrees</div>
                            <div className="grow h-2 bg-default rounded overflow-hidden">
                                <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${question.score ?? 0}%` }} />
                            </div>
                            <div className="font-semibold w-[20%] text-xs">{question.score ? 100 - question.score : 0}% disagrees</div>
                        </div>
                    )}
                    {question.input === 'textarea' && (
                        <ul className="list-none p-0 m-0 flex flex-col gap-2 mx-6">
                            {feedbacks.map((review, index) => (
                                <li key={index} className="bg-surface-secondary border border-default rounded px-3 py-2 text-sm">
                                    {review[question.id]}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

export default FeedbackTab;
