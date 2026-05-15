import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Skeleton, toast, Tooltip } from '@heroui/react';
import { FC } from 'react';
import useSWR from 'swr';

import { SuggestionsBox } from '@/components/ViewPaper/SmartSuggestions/styled';
import { CLASSES } from '@/constants/graphSettings';
import { getResources } from '@/services/backend/resources';
import { Node, PaginatedResponse, Resource } from '@/services/backend/types';
import { classifyPaper, nlpServiceUrl } from '@/services/orkgNlp';

type SmartSuggestionsFieldsProps = {
    handleFieldSelect: (selected: Node, submit?: boolean) => void;
    title?: string | null;
    abstract?: string | null;
};

const SmartSuggestionsFields: FC<SmartSuggestionsFieldsProps> = ({ handleFieldSelect, title = null, abstract = null }) => {
    const { data: classifiedPaper, isLoading } = useSWR(
        title && abstract ? [{ smartSuggestionInputText: `${title} ${abstract}` }, nlpServiceUrl, 'classifyPaper'] : null,
        ([params]) => classifyPaper(params),
    );
    const fields = classifiedPaper?.payload.annotations ?? [];

    const handleFieldLabelSelect = async (fieldLabel: string) => {
        const fieldResources = (await getResources({ q: fieldLabel, include: [CLASSES.RESEARCH_FIELD] })) as PaginatedResponse<Resource>;

        if (fieldResources.content.length === 0) {
            toast.danger('The selected research field does not exist in the ORKG. Please select a different field');
            return;
        }

        handleFieldSelect(
            {
                id: fieldResources.content[0]?.id,
                label: fieldResources.content[0]?.label,
            },
            true,
        );
    };

    return (
        (fields.length > 0 || isLoading) && (
            <SuggestionsBox className="mb-4 rounded px-4">
                <h3 className="font-bold text-lg mt-1">
                    <Tooltip delay={0}>
                        <Tooltip.Trigger>
                            <span>
                                Smart suggested fields <FontAwesomeIcon icon={faQuestionCircle} className="text-accent" />
                            </span>
                        </Tooltip.Trigger>
                        <Tooltip.Content showArrow>
                            <Tooltip.Arrow />
                            The listed smart suggestions are research fields based on the article's title and abstract (if available)
                        </Tooltip.Content>
                    </Tooltip>
                </h3>
                {!isLoading ? (
                    <div className="flex flex-wrap">
                        {fields.map((field) => (
                            <Button
                                key={field.research_field}
                                onPress={() => handleFieldLabelSelect(field.research_field)}
                                className="mr-2 mb-2 text-left rounded-full bg-smart-darker text-white hover:bg-smart border-0"
                                size="sm"
                            >
                                {field.research_field}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="mt-2 mb-1 flex flex-wrap gap-2">
                        <Skeleton className="w-[250px] h-8 rounded-full bg-smart" />
                        <Skeleton className="w-[200px] h-8 rounded-full bg-smart" />
                        <Skeleton className="w-[220px] h-8 rounded-full bg-smart" />
                        <Skeleton className="w-[220px] h-8 rounded-full bg-smart" />
                    </div>
                )}
            </SuggestionsBox>
        )
    );
};

export default SmartSuggestionsFields;
