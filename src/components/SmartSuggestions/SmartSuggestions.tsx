'use client';

import { faQuestionCircle, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover, Tooltip } from '@heroui/react';
import { sendEvent } from '@socialgouv/matomo-next';
import { FC, ReactNode, useEffect } from 'react';

import Feedback from '@/components/SmartSuggestions/Feedback';

type SmartSuggestionsProps = {
    children: ReactNode;
    tooltipContent: ReactNode;
    isOpenSmartTooltip: boolean;
    setIsOpenSmartTooltip: (isOpen: boolean) => void;
    inputData: object;
    outputData: object;
    llmTask: string;
    handleReload: () => void;
    /** hover hint on the trigger button, hidden while the panel is open */
    triggerTooltip?: ReactNode;
};

const SmartSuggestions: FC<SmartSuggestionsProps> = ({
    children,
    tooltipContent,
    isOpenSmartTooltip,
    setIsOpenSmartTooltip,
    inputData,
    outputData,
    llmTask,
    handleReload,
    triggerTooltip,
}) => {
    useEffect(() => {
        if (isOpenSmartTooltip) {
            sendEvent({ category: 'smart-suggestions', action: 'open-tooltip', name: llmTask });
        }
    }, [isOpenSmartTooltip, llmTask]);

    const panel = (
        <Popover isOpen={isOpenSmartTooltip} onOpenChange={setIsOpenSmartTooltip}>
            {/* the trigger button is passed directly, so it keeps its own DOM node: two of the call
                sites position it absolutely and an extra wrapper would break that */}
            {children}
            <Popover.Content className="w-[400px] max-w-[400px] border-0 bg-smart p-0 text-white">
                <Popover.Dialog className="p-0">
                    {/* custom arrow so it takes the smart colour: HeroUI's default arrow is hard-wired
                        to `fill: var(--overlay)`, which a class on the wrapper cannot override */}
                    <Popover.Arrow>
                        <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" className="!fill-smart">
                            <path d="M0 0C5.48483 8 6.5 8 12 0Z" />
                        </svg>
                    </Popover.Arrow>
                    <div className="flex items-center justify-between rounded-t-3xl bg-smart-darker px-4 py-2.5">
                        <div className="flex items-center font-semibold text-white">
                            <span className="whitespace-nowrap">Smart suggestions</span>{' '}
                            <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                    <a href="https://orkg.org/help-center/article/53/Smart_suggestions" target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faQuestionCircle} className="ml-2 text-white opacity-75" />
                                    </a>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow>
                                    <Tooltip.Arrow />
                                    More information
                                </Tooltip.Content>
                            </Tooltip>
                            <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="ghost"
                                        aria-label="Reload suggestions"
                                        onPress={handleReload}
                                        className="ml-1 border-0 bg-transparent px-1 py-0 align-baseline text-white opacity-75 hover:bg-white/10"
                                    >
                                        <FontAwesomeIcon icon={faRotateRight} />
                                    </Button>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow>
                                    <Tooltip.Arrow />
                                    Reload suggestions
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                        <span className="flex items-center">
                            Feedback <Feedback type="positive" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                            <Feedback type="neutral" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                            <Feedback type="negative" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                        </span>
                    </div>
                    <div className="px-4 pt-2 pb-4 flex flex-col">{tooltipContent}</div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );

    if (!triggerTooltip) {
        return panel;
    }

    return (
        <Tooltip delay={0} isDisabled={isOpenSmartTooltip}>
            <Tooltip.Trigger>{panel}</Tooltip.Trigger>
            <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                {triggerTooltip}
            </Tooltip.Content>
        </Tooltip>
    );
};

export default SmartSuggestions;
