import { FloatingTree } from '@floating-ui/react';
import { faLightbulb, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';

import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import { getLlmResponse } from '@/services/orkgNlp';

const SmartLiteralTypeCheck = ({ label = '' }) => {
    const [response, setResponse] = useState({});
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
                            <div className="ms-2 mb-2">
                                <FontAwesomeIcon icon={faSpinner} spin />
                            </div>
                        )}
                        {!isLoading && !isFailed && (
                            <div>
                                <hr />
                                <h2 className="text-white h6 mb-2 d-flex align-items-center">Type advice</h2>
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
                <button type="button" className="btn btn-smart btn-sm p-0" onClick={() => setIsOpenSmartTooltip((v) => !v)}>
                    <FontAwesomeIcon className="px-3 py-1" icon={faLightbulb} style={{ fontSize: '120%' }} />
                </button>
            </SmartSuggestions>
        </Tooltip>
    );
};

SmartLiteralTypeCheck.propTypes = {
    label: PropTypes.string,
};

export default SmartLiteralTypeCheck;
