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

type SmartLiteralTypeCheckProps = {
    label?: string;
    className?: string;
};

const SmartLiteralTypeCheck: FC<SmartLiteralTypeCheckProps> = ({ label = '', className = '' }) => {
    const [response, setResponse] = useState<LlmFeedback>({});
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);

    const getChatResponse = useCallback(async () => {
        if (!label) {
            return;
        }
        setIsLoading(true);
        setIsFailed(false);

        try {
            const _response = await getLlmResponse({
                taskName: LLM_TASK_NAMES.CHECK_IF_LITERAL_TYPE_IS_CORRECT,
                placeholders: { label },
            });
            setResponse(_response);
        } catch (e) {
            console.error(e);
            setResponse({});
            setIsFailed(true);
        } finally {
            setIsLoading(false);
        }
    }, [label]);

    useEffect(() => {
        if (!isOpenSmartTooltip) {
            setResponse({});
            return;
        }
        getChatResponse();
    }, [getChatResponse, isOpenSmartTooltip]);

    return (
        <Tooltip content="Check if literal type is correct">
            <SmartSuggestions
                tooltipContent={
                    <>
                        <p className="m-0 mb-2">
                            Based on the label, we try to advise whether your text should be a resource or text (also called literal).
                        </p>
                        {isLoading && (
                            <div className="ml-2 mb-2">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        )}
                        {!isLoading && !isFailed && (
                            <div>
                                <Separator className="my-3" />
                                <div className="text-white font-semibold mb-1">Type advice</div>
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
                        {!label && <em>No label provided</em>}
                    </>
                }
                isOpenSmartTooltip={isOpenSmartTooltip}
                setIsOpenSmartTooltip={setIsOpenSmartTooltip}
                inputData={{ label }}
                outputData={response}
                llmTask={LLM_TASK_NAMES.CHECK_IF_LITERAL_TYPE_IS_CORRECT}
                handleReload={getChatResponse}
            >
                <SmartTriggerButton
                    ariaLabel="Check if literal type is correct"
                    onPress={() => setIsOpenSmartTooltip((v) => !v)}
                    className={className}
                />
            </SmartSuggestions>
        </Tooltip>
    );
};

export default SmartLiteralTypeCheck;
