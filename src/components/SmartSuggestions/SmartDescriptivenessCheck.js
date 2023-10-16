import { faLightbulb, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import SmartSuggestions from 'components/SmartSuggestions/SmartSuggestions';
import LLM_TASK_NAMES from 'constants/llmTasks';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { getLlmResponse } from 'services/orkgNlp';

export const SmartDescriptivenessCheck = ({ value = '' }) => {
    const [response, setResponse] = useState({});
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
        <SmartSuggestions
            tooltipContent={
                <>
                    <p className="m-0 mb-2">Based on the description you provided, we provide feedback on how to improve it</p>
                    {isLoading && (
                        <div className="ms-2 mb-2">
                            <Icon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <hr />
                            <h2 className="text-white h6 mb-2 d-flex align-items-center">Feedback</h2>
                            <p className="fst-italic">{response.feedback}</p>
                        </div>
                    )}
                    {isFailed && (
                        <em>
                            Failed to load recommendation.{' '}
                            <Button color="link" size="sm" className="text-white p-0 border-0 align-baseline" onClick={getChatResponse}>
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
            <Tippy content="Check descriptiveness of the text">
                <button
                    className="btn btn-smart btn-sm px-3 position-absolute"
                    style={{ right: 5, top: 5 }}
                    onClick={() => setIsOpenSmartTooltip(v => !v)}
                >
                    <Icon icon={faLightbulb} style={{ fontSize: '120%' }} />
                </button>
            </Tippy>
        </SmartSuggestions>
    );
};

SmartDescriptivenessCheck.propTypes = {
    value: PropTypes.string,
};

export default SmartDescriptivenessCheck;
