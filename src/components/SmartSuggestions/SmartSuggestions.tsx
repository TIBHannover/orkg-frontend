'use client';

import { faQuestionCircle, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { forwardRef, useEffect } from 'react';
import { Button } from 'reactstrap';
import styled, { useTheme } from 'styled-components';

import Popover from '@/components/FloatingUI/Popover';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Feedback from '@/components/SmartSuggestions/Feedback';

const TippyContentStyle = styled.div`
    border-radius: 0.25rem;
    background: ${(props) => props.theme.smart} !important;
    > .tippy-arrow {
        color: ${(props) => props.theme.smart} !important;
    }
`;

type SmartSuggestionsProps = {
    children: React.ReactNode;
    tooltipContent: React.ReactNode;
    isOpenSmartTooltip: boolean;
    setIsOpenSmartTooltip: (isOpen: boolean) => void;
    inputData: any;
    outputData: any;
    llmTask: string;
    handleReload: () => void;
};

const SmartSuggestions = forwardRef<HTMLDivElement, SmartSuggestionsProps>(
    ({ children, tooltipContent, isOpenSmartTooltip, setIsOpenSmartTooltip, inputData, outputData, llmTask, handleReload }, ref) => {
        const { trackEvent } = useMatomo();
        const theme = useTheme();

        useEffect(() => {
            if (isOpenSmartTooltip) {
                trackEvent({ category: 'smart-suggestions', action: 'open-tooltip', name: llmTask });
            }
        }, [isOpenSmartTooltip, llmTask, trackEvent]);

        return (
            <Popover
                ref={ref}
                content={
                    isOpenSmartTooltip ? ( // ensure content is unmounted when tooltip is not open
                        <TippyContentStyle>
                            <div
                                className="px-3 rounded-top d-flex justify-content-between bg-smart-darker align-items-center"
                                style={{ paddingTop: 10, paddingBottom: 10 }}
                            >
                                <h2 className="h6 text-white m-0">
                                    Smart suggestions{' '}
                                    <Tooltip content="More information">
                                        <a href="https://orkg.org/help-center/article/53/Smart_suggestions" target="_blank" rel="noopener noreferrer">
                                            <FontAwesomeIcon icon={faQuestionCircle} className="text-white ms-2 opacity-75" />
                                        </a>
                                    </Tooltip>
                                    <Tooltip content="Reload suggestions">
                                        <span>
                                            <Button
                                                onClick={handleReload}
                                                color="link"
                                                className="ms-1 text-white opacity-75 py-0 px-1 border-0 align-baseline"
                                            >
                                                <FontAwesomeIcon icon={faRotateRight} />
                                            </Button>
                                        </span>
                                    </Tooltip>
                                </h2>
                                <span className="d-flex align-items-center">
                                    Feedback <Feedback type="positive" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                    <Feedback type="neutral" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                    <Feedback type="negative" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                </span>
                            </div>
                            <div className="pt-2 px-3 pb-3">{tooltipContent}</div>
                        </TippyContentStyle>
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
