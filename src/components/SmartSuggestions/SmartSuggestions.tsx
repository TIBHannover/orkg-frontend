'use client';

import { faQuestionCircle, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { forwardRef, useEffect } from 'react';
import { useTheme } from 'styled-components';

import Popover from '@/components/FloatingUI/Popover';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Feedback from '@/components/SmartSuggestions/Feedback';

type SmartSuggestionsProps = {
    children: React.ReactNode;
    tooltipContent: React.ReactNode;
    isOpenSmartTooltip: boolean;
    setIsOpenSmartTooltip: (isOpen: boolean) => void;
    inputData: object;
    outputData: object;
    llmTask: string;
    handleReload: () => void;
};

const SmartSuggestions = forwardRef<HTMLDivElement, SmartSuggestionsProps>(
    ({ children, tooltipContent, isOpenSmartTooltip, setIsOpenSmartTooltip, inputData, outputData, llmTask, handleReload }, ref) => {
        const theme = useTheme();

        useEffect(() => {
            if (isOpenSmartTooltip) {
                sendEvent({ category: 'smart-suggestions', action: 'open-tooltip', name: llmTask });
            }
        }, [isOpenSmartTooltip, llmTask]);

        return (
            <Popover
                ref={ref}
                content={
                    isOpenSmartTooltip ? (
                        <div className="rounded bg-smart">
                            <div
                                className="px-4 rounded-t flex justify-between bg-smart-darker items-center"
                                style={{ paddingTop: 10, paddingBottom: 10 }}
                            >
                                <div className="font-semibold text-white flex items-center">
                                    Smart suggestions{' '}
                                    <Tooltip content="More information">
                                        <a href="https://orkg.org/help-center/article/53/Smart_suggestions" target="_blank" rel="noopener noreferrer">
                                            <FontAwesomeIcon icon={faQuestionCircle} className="text-white ml-2 opacity-75" />
                                        </a>
                                    </Tooltip>
                                    <Tooltip content="Reload suggestions">
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="ghost"
                                            aria-label="Reload suggestions"
                                            onPress={handleReload}
                                            className="ml-1 text-white opacity-75 py-0 px-1 border-0 align-baseline bg-transparent hover:bg-white/10"
                                        >
                                            <FontAwesomeIcon icon={faRotateRight} />
                                        </Button>
                                    </Tooltip>
                                </div>
                                <span className="flex items-center">
                                    Feedback <Feedback type="positive" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                    <Feedback type="neutral" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                    <Feedback type="negative" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                </span>
                            </div>
                            <div className="pt-2 px-4 pb-4">{tooltipContent}</div>
                        </div>
                    ) : null
                }
                open={isOpenSmartTooltip}
                onOpenChange={setIsOpenSmartTooltip}
                contentStyle={{ maxWidth: '400px', padding: 0 }}
                arrowFill={theme.smart}
                modal
            >
                {children}
            </Popover>
        );
    },
);

SmartSuggestions.displayName = 'SmartSuggestions';

export default SmartSuggestions;
