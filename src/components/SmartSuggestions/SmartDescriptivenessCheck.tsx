import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { FC, useCallback, useEffect, useState } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { getLlmResponse } from '@/services/orkgNlp';

type LlmFeedback = { feedback?: string };

type SmartDescriptivenessCheckProps = {
    value?: string;
};

export const SmartDescriptivenessCheck: FC<SmartDescriptivenessCheckProps> = ({ value = '' }) => {
    const [response, setResponse] = useState<LlmFeedback>({});
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const getChatResponse = useCallback(async () => {
        if (!value) {
            return;
        }
        setIsLoading(true);
        setIsFailed(false);

        try {
            const _response = await getLlmResponse({
                taskName: LLM_TASK_NAMES.CHECK_DESCRIPTIVENESS,
                placeholders: { value },
            });
            setResponse(_response);
        } catch (e) {
            setResponse({});
            setIsFailed(true);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [value]);

    useEffect(() => {
        if (!isOpenSmartTooltip) {
            setResponse({});
            return;
        }
        getChatResponse();
    }, [getChatResponse, isOpenSmartTooltip]);

    return (
        <Tooltip content="Check descriptiveness of the text">
            <SmartSuggestions
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
                                <p className="italic">{response.feedback}</p>
                            </div>
                        )}
                        {isFailed && (
                            <em>
                                Failed to load recommendation.{' '}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onPress={getChatResponse}
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
                outputData={response}
                llmTask={LLM_TASK_NAMES.CHECK_DESCRIPTIVENESS}
                handleReload={getChatResponse}
            >
                <SmartTriggerButton absolute ariaLabel="Check descriptiveness of the text" onPress={() => setIsOpenSmartTooltip((v) => !v)} />
            </SmartSuggestions>
        </Tooltip>
    );
};

export default SmartDescriptivenessCheck;
