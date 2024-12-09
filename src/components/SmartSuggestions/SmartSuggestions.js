'use client';

import { faQuestionCircle, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import Tippy from '@tippyjs/react';
import Feedback from 'components/SmartSuggestions/Feedback';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Button } from 'reactstrap';
import styled from 'styled-components';

const TippyStyle = styled(Tippy)`
    &.tippy-box {
        min-width: 400px;
        background: ${(props) => props.theme.smart} !important;
        > .tippy-arrow {
            color: ${(props) => props.theme.smart} !important;
        }
        > .tippy-content {
            padding: 0;
        }
    }
`;

const SmartSuggestions = ({ children, tooltipContent, isOpenSmartTooltip, setIsOpenSmartTooltip, inputData, outputData, llmTask, handleReload }) => {
    const { trackEvent } = useMatomo();

    useEffect(() => {
        if (isOpenSmartTooltip) {
            trackEvent({ category: 'smart-suggestions', action: 'open-tooltip', name: llmTask });
        }
    }, [isOpenSmartTooltip, llmTask, trackEvent]);

    return (
        <TippyStyle
            content={
                isOpenSmartTooltip ? ( // ensure content is unmounted when tooltip is not open
                    <>
                        <div
                            className="px-3 rounded-top d-flex justify-content-between bg-smart-darker align-items-center"
                            style={{ paddingTop: 10, paddingBottom: 10 }}
                        >
                            <h2 className="h6 text-white m-0">
                                Smart suggestions{' '}
                                <Tippy content="More information">
                                    <a href="https://orkg.org/help-center/article/53/Smart_suggestions" target="_blank" rel="noopener noreferrer">
                                        <FontAwesomeIcon icon={faQuestionCircle} className="text-white ms-2 opacity-75" />
                                    </a>
                                </Tippy>
                                <Tippy content="Reload suggestions">
                                    <span>
                                        <Button
                                            onClick={handleReload}
                                            color="link"
                                            className="ms-1 text-white opacity-75 py-0 px-1 border-0 align-baseline"
                                        >
                                            <FontAwesomeIcon icon={faRotateRight} />
                                        </Button>
                                    </span>
                                </Tippy>
                            </h2>
                            <span className="d-flex align-items-center">
                                Feedback <Feedback type="positive" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                <Feedback type="neutral" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                                <Feedback type="negative" inputData={inputData} outputData={outputData} llmTask={llmTask} />
                            </span>
                        </div>
                        <div className="pt-2 px-3 pb-3">{tooltipContent}</div>
                    </>
                ) : null
            }
            appendTo={document?.body ?? undefined}
            interactive
            visible={isOpenSmartTooltip}
            onClickOutside={() => setIsOpenSmartTooltip(false)}
            className="shadow"
        >
            {children}
        </TippyStyle>
    );
};

SmartSuggestions.propTypes = {
    children: PropTypes.node.isRequired,
    tooltipContent: PropTypes.node.isRequired,
    isOpenSmartTooltip: PropTypes.bool.isRequired,
    setIsOpenSmartTooltip: PropTypes.func.isRequired,
    inputData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    outputData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    llmTask: PropTypes.string.isRequired,
    handleReload: PropTypes.func.isRequired,
};

export default SmartSuggestions;
