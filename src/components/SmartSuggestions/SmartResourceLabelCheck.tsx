import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { FC, useState } from 'react';

import useLlmSuggestion from '@/components/SmartSuggestions/hooks/useLlmSuggestion';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import LLM_TASK_NAMES from '@/constants/llmTasks';

type LlmFeedback = { feedback?: string };

type SmartResourceLabelCheckProps = {
    label?: string;
    className?: string;
};

const SmartResourceLabelCheck: FC<SmartResourceLabelCheckProps> = ({ label = '', className = '' }) => {
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);

    const {
        data: response,
        isLoading,
        isFailed,
        reload,
    } = useLlmSuggestion<LlmFeedback>({
        taskName: LLM_TASK_NAMES.CHECK_RESOURCE_DESTRUCTURING,
        placeholders: { label },
        isEnabled: isOpenSmartTooltip && !!label,
    });

    return (
        <SmartSuggestions
            triggerTooltip="Check if resource is properly structured"
            tooltipContent={
                <>
                    <p className="m-0 mb-2">Based on the label you provided, we try to advise how your resource should be structured.</p>
                    {isLoading && (
                        <div className="ml-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <Separator className="my-3" />
                            <div className="text-white font-semibold mb-1">Restructuring feedback</div>
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
            llmTask={LLM_TASK_NAMES.CHECK_RESOURCE_DESTRUCTURING}
            handleReload={reload}
        >
            <SmartTriggerButton ariaLabel="Check if resource is properly structured" className={className} />
        </SmartSuggestions>
    );
};

export default SmartResourceLabelCheck;
