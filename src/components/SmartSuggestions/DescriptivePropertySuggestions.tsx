import { faLightbulb, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';

import Tooltip from '@/components/FloatingUI/Tooltip';
import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import LLM_TASK_NAMES from '@/constants/llmTasks';
import ROUTES from '@/constants/routes';
import { getLlmResponse } from '@/services/orkgNlp';

type SmartDescriptivePropertyProps = {
    propertyLabel: string;
    setDescription: (description: string) => void;
};

export const SmartDescriptiveProperty: FC<SmartDescriptivePropertyProps> = ({ propertyLabel, setDescription }) => {
    const [recommendedPropertyDescription, setRecommendedPropertyDescription] = useState('');
    const [isOpenSmartTooltip, setIsOpenSmartTooltip] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFailed, setIsFailed] = useState(false);
    const pathname = usePathname();
    // @ts-expect-error awaiting migration contributionEditor slice
    const properties = useSelector((state) => state.contributionEditor.properties);

    const isContributionEditor = !!match(ROUTES.CONTRIBUTION_EDITOR)(pathname);

    const paperTitle = useSelector((state) =>
        // @ts-expect-error
        isContributionEditor ? Object.values(state.contributionEditor.papers)?.[0]?.label : state.viewPaper?.paper?.title,
    );

    const researchField = useSelector((state) =>
        // @ts-expect-error
        isContributionEditor ? '' : state.viewPaper?.paper?.research_fields?.[0]?.label,
    );

    const getChatResponse = useCallback(async () => {
        if (!properties || properties.length === 0) {
            return;
        }
        setIsLoading(true);
        setIsFailed(false);

        try {
            const llmResponse = await getLlmResponse({
                taskName: LLM_TASK_NAMES.RECOMMEND_PROPERTIES_DESCRIPTION,
                placeholders: { predicate: propertyLabel, title: paperTitle || '', field: researchField || '' },
            });
            const predicateDescription = llmResponse?.description;
            setRecommendedPropertyDescription(predicateDescription || '');
        } catch (e) {
            setRecommendedPropertyDescription('');
            setIsFailed(true);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(properties)]);

    useEffect(() => {
        if (!isOpenSmartTooltip) {
            setRecommendedPropertyDescription('');
            return;
        }
        getChatResponse();
    }, [getChatResponse, isOpenSmartTooltip]);

    const handleDescription = (description: string) => {
        setDescription(description);
        setIsOpenSmartTooltip((v) => !v);
    };
    return (
        <SmartSuggestions
            tooltipContent={
                <>
                    <p className="m-0 mb-2">Based on the property label and the paper context, we provide a possible property description</p>
                    {isLoading && (
                        <div className="ms-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <hr />
                            <h2 className="text-white h6 mb-2 d-flex align-items-center">Property description</h2>

                            <p className="fst-italic">{recommendedPropertyDescription}</p>
                        </div>
                    )}
                    <div>
                        <Button
                            color="smart-darker"
                            size="sm"
                            className="float-right"
                            onClick={() => handleDescription(recommendedPropertyDescription)}
                        >
                            Insert
                        </Button>
                    </div>
                    {isFailed && (
                        <em>
                            Failed to load recommendation.{' '}
                            <Button color="link" size="sm" className="text-white p-0 border-0 align-baseline" onClick={getChatResponse}>
                                Try again.
                            </Button>
                        </em>
                    )}
                    {(!properties || properties.length === 0) && (
                        <em>No properties description added yet, first add properties yourself to use this functionality</em>
                    )}
                </>
            }
            isOpenSmartTooltip={isOpenSmartTooltip}
            setIsOpenSmartTooltip={setIsOpenSmartTooltip}
            inputData={{ properties }}
            outputData={{ recommendedPropertyDescription }}
            llmTask={LLM_TASK_NAMES.RECOMMEND_PROPERTIES_DESCRIPTION}
            handleReload={getChatResponse}
        >
            <button
                type="button"
                onClick={() => setIsOpenSmartTooltip((v) => !v)}
                style={{ right: 5, top: 5 }}
                className="btn btn-smart btn-sm p-0 position-absolute p-0"
            >
                <Tooltip content="Automatically generate a property description" disabled={isOpenSmartTooltip}>
                    <FontAwesomeIcon className="px-3 py-1" icon={faLightbulb} style={{ fontSize: '120%' }} />
                </Tooltip>
            </button>
        </SmartSuggestions>
    );
};

export default SmartDescriptiveProperty;
