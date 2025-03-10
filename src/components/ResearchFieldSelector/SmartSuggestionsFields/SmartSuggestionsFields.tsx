import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import Tooltip from 'components/FloatingUI/Tooltip';
import { SuggestionsBox } from 'components/ViewPaper/SmartSuggestions/styled';
import { CLASSES } from 'constants/graphSettings';
import { FC } from 'react';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { getResources } from 'services/backend/resources';
import { Node, PaginatedResponse, Resource } from 'services/backend/types';
import { classifyPaper, nlpServiceUrl } from 'services/orkgNlp';
import useSWR from 'swr';

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
            toast.error('The selected research field does not exist in the ORKG. Please select a different field');
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
            <SuggestionsBox className="mb-3 rounded p-2 px-3">
                <h3 className="fw-bold h6 mt-1">
                    <Tooltip content="The listed smart suggestions are research fields based on the article's title and abstract (if available)">
                        <span>
                            Smart suggested fields <FontAwesomeIcon icon={faQuestionCircle} className="text-primary" />
                        </span>
                    </Tooltip>
                </h3>
                {!isLoading ? (
                    <div className="d-flex flex-wrap">
                        {fields.map((field) => (
                            <Button
                                key={field.research_field}
                                color="smart"
                                onClick={() => handleFieldLabelSelect(field.research_field)}
                                className="me-2 mb-2 text-start rounded-pill"
                                size="sm"
                            >
                                {field.research_field}
                            </Button>
                        ))}
                    </div>
                ) : (
                    <div className="mt-2 mb-1">
                        <ContentLoader height={75} width="100%" foregroundColor="#9cdde7" backgroundColor="#d6ebef">
                            <rect x="0" y="0" rx="16" ry="16" width="250" height="33" />
                            <rect x="270" y="0" rx="16" ry="16" width="200" height="33" />
                            <rect x="490" y="0" rx="16" ry="16" width="220" height="33" />
                            <rect x="0" y="42" rx="16" ry="16" width="220" height="33" />
                        </ContentLoader>
                    </div>
                )}
            </SuggestionsBox>
        )
    );
};

export default SmartSuggestionsFields;
