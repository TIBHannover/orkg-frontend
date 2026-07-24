import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { FC, useState } from 'react';

import useLlmSuggestion from '@/components/SmartSuggestions/hooks/useLlmSuggestion';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import LLM_TASK_NAMES from '@/constants/llmTasks';

type LlmFeedback = { feedback?: string };

type SmartPropertyGuidelinesCheckProps = {
    label?: string;
    className?: string;
};

const SmartPropertyGuidelinesCheck: FC<SmartPropertyGuidelinesCheckProps> = ({ label = '', className = '' }) => {
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);

    const {
        data: response,
        isLoading,
        isFailed,
        reload,
    } = useLlmSuggestion<LlmFeedback>({
        taskName: LLM_TASK_NAMES.CHECK_PROPERTY_LABEL_GUIDELINES,
        placeholders: { label },
        isEnabled: isOpenSmartTooltip && !!label,
    });

    return (
        <SmartSuggestions
            triggerTooltip="Check if label is sufficiently reusable"
            tooltipContent={
                <>
                    <p className="m-0 mb-2">Based on the label we try to estimate whether the predicate is reusable.</p>
                    {isLoading && (
                        <div className="ml-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <Separator className="my-3" />
                            <div className="text-white font-semibold mb-1">Reusability check</div>
                            <p className="italic">{response?.feedback}</p>
                        </div>
                    )}
                    {isFailed && (
                        <em>
                            Failed to load recommendation.{' '}
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={reload}
                                className="!p-0 !min-w-0 !h-auto text-white border-0 bg-transparent align-baseline underline"
                            >
                                Try again.
                            </Button>
                        </em>
                    )}
                    {!label && <em>No label provided</em>}
                </>
            }
            isOpenSmartTooltip={isOpenSmartTooltip}
            setIsOpenSmartTooltip={setIsOpenSmartTooltip}
            inputData={{ label }}
            outputData={response ?? {}}
            llmTask={LLM_TASK_NAMES.CHECK_PROPERTY_LABEL_GUIDELINES}
            handleReload={reload}
        >
            <SmartTriggerButton ariaLabel="Check if label is sufficiently reusable" className={className} />
        </SmartSuggestions>
    );
};

export default SmartPropertyGuidelinesCheck;
