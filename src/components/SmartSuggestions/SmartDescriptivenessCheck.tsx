import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { FC, useState } from 'react';

import useLlmSuggestion from '@/components/SmartSuggestions/hooks/useLlmSuggestion';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import LLM_TASK_NAMES from '@/constants/llmTasks';

type LlmFeedback = { feedback?: string };

type SmartDescriptivenessCheckProps = {
    value?: string;
};

export const SmartDescriptivenessCheck: FC<SmartDescriptivenessCheckProps> = ({ value = '' }) => {
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);

    const {
        data: response,
        isLoading,
        isFailed,
        reload,
    } = useLlmSuggestion<LlmFeedback>({
        taskName: LLM_TASK_NAMES.CHECK_DESCRIPTIVENESS,
        placeholders: { value },
        isEnabled: isOpenSmartTooltip && !!value,
    });

    return (
        <SmartSuggestions
            triggerTooltip="Check descriptiveness of the text"
            tooltipContent={
                <>
                    <p className="m-0 mb-2">Based on the description you provided, we provide feedback on how to improve it</p>
                    {isLoading && (
                        <div className="ml-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <Separator className="my-3" />
                            <div className="text-white font-semibold mb-1">Feedback</div>
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
                    {!value && <em>No description provided</em>}
                </>
            }
            isOpenSmartTooltip={isOpenSmartTooltip}
            setIsOpenSmartTooltip={setIsOpenSmartTooltip}
            inputData={{ value }}
            outputData={response ?? {}}
            llmTask={LLM_TASK_NAMES.CHECK_DESCRIPTIVENESS}
            handleReload={reload}
        >
            <SmartTriggerButton ariaLabel="Check descriptiveness of the text" />
        </SmartSuggestions>
    );
};

export default SmartDescriptivenessCheck;
