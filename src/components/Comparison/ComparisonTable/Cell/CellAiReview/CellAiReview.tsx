import { faCheck, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover } from '@heroui/react';
import { FC, useState } from 'react';

import { useComparisonAiReview } from '@/components/Comparison/ComparisonTable/AiReview/ComparisonAiReviewProvider';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { ExtractionMethod } from '@/services/backend/types';

type CellAiReviewProps = {
    statementId: string;
    extractionMethod: ExtractionMethod;
};

const CellAiReview: FC<CellAiReviewProps> = ({ statementId, extractionMethod }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { setExtractionMethod, isIncorrect, markIncorrect, unmarkIncorrect } = useComparisonAiReview();

    const incorrect = isIncorrect(statementId);
    const isReviewed = !incorrect && extractionMethod === EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW;

    const handleYes = () => {
        setIsOpen(false);
        unmarkIncorrect(statementId);
        if (extractionMethod !== EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW) {
            setExtractionMethod(statementId, EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW);
        }
    };

    const handleNo = () => {
        setIsOpen(false);
        markIncorrect(statementId);
    };

    let icon = faTriangleExclamation;
    let buttonClassName = 'min-w-6 h-6 w-6 p-0 rounded-full bg-gray-100 text-amber-500 hover:bg-gray-200';
    let ariaLabel = 'Review AI-generated value';
    if (incorrect) {
        icon = faXmark;
        buttonClassName = 'min-w-6 h-6 w-6 p-0 rounded-full bg-red-100 text-red-600 hover:bg-red-200';
        ariaLabel = 'Value marked incorrect, click to change';
    } else if (isReviewed) {
        icon = faCheck;
        buttonClassName = 'min-w-6 h-6 w-6 p-0 rounded-full bg-green-100 text-green-600 hover:bg-green-200';
        ariaLabel = 'Reviewed value, click to change';
    }

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Tooltip content="Rejected statements will be removed when publishing a comparison" disabled={!incorrect}>
                <Button isIconOnly variant="ghost" size="sm" aria-label={ariaLabel} className={buttonClassName}>
                    <FontAwesomeIcon icon={icon} />
                </Button>
            </Tooltip>
            <Popover.Content placement="top">
                <Popover.Dialog>
                    <Popover.Arrow />
                    <div className="flex flex-col gap-2 p-1 max-w-80">
                        <span className="text-sm font-medium">This statement is generated automatically. Please verify its correctness.</span>
                        <div className="flex gap-2">
                            <Button size="sm" variant={isReviewed ? 'primary' : 'tertiary'} onPress={handleYes}>
                                Accept
                            </Button>
                            <Button size="sm" variant={incorrect ? 'primary' : 'tertiary'} onPress={handleNo}>
                                Reject
                            </Button>
                        </div>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default CellAiReview;
