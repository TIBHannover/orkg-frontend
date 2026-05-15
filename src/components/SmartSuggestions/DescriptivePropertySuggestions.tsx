import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Separator } from '@heroui/react';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import SmartSuggestions from '@/components/SmartSuggestions/SmartSuggestions';
import SmartTriggerButton from '@/components/SmartSuggestions/SmartTriggerButton';
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

    const isContributionEditor = !!match(ROUTES.GRID_EDITOR)(pathname);

    // @ts-expect-error awaiting migration viewPaper slice
    const paperTitle = useSelector((state) => (isContributionEditor ? '' : state.viewPaper?.paper?.title));

    const researchField = useSelector((state) =>
        // @ts-expect-error
        isContributionEditor ? '' : state.viewPaper?.paper?.research_fields?.[0]?.label,
    );

    const properties: unknown[] = [];

    const getChatResponse = useCallback(async () => {
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
    }, []);

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
                        <div className="ml-2 mb-2">
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </div>
                    )}
                    {!isLoading && !isFailed && (
                        <div>
                            <Separator className="my-3" />
                            <div className="text-white font-semibold mb-1">Property description</div>
                            <p className="italic">{recommendedPropertyDescription}</p>
                        </div>
                    )}
                    <div>
                        <Button
                            size="sm"
                            onPress={() => handleDescription(recommendedPropertyDescription)}
                            className="float-right bg-smart-darker text-white hover:bg-smart border-0"
                        >
                            Insert
                        </Button>
                    </div>
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
            <SmartTriggerButton absolute ariaLabel="Automatically generate a property description" onPress={() => setIsOpenSmartTooltip((v) => !v)} />
        </SmartSuggestions>
    );
};

export default SmartDescriptiveProperty;
