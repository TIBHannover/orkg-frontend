import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn, Modal, Spinner } from '@heroui/react';
import { Dispatch, FC, SetStateAction, useState } from 'react';

import FeedbackTab from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/FeedbackTab/FeedbackTab';
import useQualityReport from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/hooks/useQualityReport';
import Recommendation from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/QualityReportModal/Recommendation/Recommendation';
import useComparison from '@/components/Comparison/hooks/useComparison';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';

type QualityReportModalProps = {
    toggle: () => void;
    setIsOpenFeedbackModal: Dispatch<SetStateAction<boolean>>;
};

const QualityReportModal: FC<QualityReportModalProps> = ({ toggle, setIsOpenFeedbackModal }) => {
    const [selectedTab, setSelectedTab] = useState<'recommendations' | 'feedbacks'>('recommendations');
    const { comparison } = useComparison();
    const { issueRecommendations, passingRecommendations, recommendationsPercentage, feedbacksPercentage, feedbacks, isLoading } = useQualityReport();
    const stars = Math.round(feedbacksPercentage / 20);

    if (!comparison) {
        return null;
    }

    const renderTab = (key: 'recommendations' | 'feedbacks', label: string) => (
        <button
            type="button"
            role="tab"
            aria-selected={selectedTab === key}
            onClick={() => setSelectedTab(key)}
            className={cn(
                'flex-1 py-3 text-sm border-b-2 -mb-px transition-colors',
                selectedTab === key ? 'border-accent text-accent font-semibold' : 'border-transparent text-default-600 hover:text-foreground',
            )}
        >
            {label}
        </button>
    );

    return (
        <Modal.Backdrop isOpen onOpenChange={(open) => !open && toggle()}>
            <Modal.Container className="max-h-[calc(100vh-73px)] mt-[73px]">
                <Modal.Dialog className="sm:max-w-3xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Comparison quality report</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-0">
                        {isLoading ? (
                            <div className="py-12 flex items-center justify-center gap-2 text-default-500">
                                <Spinner /> Loading…
                            </div>
                        ) : (
                            <>
                                <div className="py-5 px-6 bg-surface-secondary grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-default">
                                    <div>
                                        <h6 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-2">Recommendations</h6>
                                        <div className="h-3 w-full bg-default rounded overflow-hidden">
                                            <div
                                                className="h-full bg-accent transition-[width] duration-500"
                                                style={{ width: `${recommendationsPercentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs mt-1.5 text-default-600">
                                            <span className="font-bold text-foreground">{recommendationsPercentage}%</span> of passing recommendations
                                        </div>
                                    </div>
                                    <div>
                                        <h6 className="text-xs font-semibold uppercase tracking-wider text-default-500 mb-2">User feedback</h6>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <FontAwesomeIcon
                                                    key={i}
                                                    icon={faStar}
                                                    className={cn('text-lg', stars >= i ? 'text-warning' : 'text-default')}
                                                />
                                            ))}
                                            <span className="ml-2 text-xs text-default-600">
                                                Based on {feedbacks.length} evaluation{feedbacks.length === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <RequireAuthentication
                                            component={Button}
                                            size="sm"
                                            variant="primary"
                                            className="mt-3"
                                            onClick={() => {
                                                setIsOpenFeedbackModal(true);
                                                // close the quality report modal to ensure data is reloaded after view submission
                                                toggle();
                                            }}
                                        >
                                            Write feedback
                                        </RequireAuthentication>
                                    </div>
                                </div>
                                <div role="tablist" aria-label="Quality report sections" className="flex border-b border-default bg-surface">
                                    {renderTab('recommendations', 'Recommendations')}
                                    {renderTab('feedbacks', 'User feedback')}
                                </div>
                                {selectedTab === 'recommendations' && (
                                    <div className="p-4">
                                        <h6 className="text-base font-semibold mb-3">Issues ({issueRecommendations.length})</h6>
                                        <ul className="list-none p-0 m-0 mb-6">
                                            {issueRecommendations.map(({ info, evaluation, solution, title }, index) => (
                                                <Recommendation
                                                    key={index}
                                                    title={title}
                                                    info={info}
                                                    evaluation={evaluation}
                                                    solution={solution}
                                                    type="issue"
                                                />
                                            ))}
                                        </ul>
                                        <h6 className="text-base font-semibold mb-3">Passing ({passingRecommendations.length})</h6>
                                        <ul className="list-none p-0 m-0">
                                            {passingRecommendations.map(({ info, evaluation, solution, title }, index) => (
                                                <Recommendation
                                                    key={index}
                                                    title={title}
                                                    info={info}
                                                    evaluation={evaluation}
                                                    solution={solution}
                                                    type="success"
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedTab === 'feedbacks' && <FeedbackTab feedbacks={feedbacks} comparisonId={comparison.id} />}
                            </>
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default QualityReportModal;
