import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { classifyPaper } from 'services/orkgNlp';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getResources } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';
import ContentLoader from 'react-content-loader';
import { SuggestionsBox } from 'components/ViewPaper/SmartSuggestions/styled';

const SmartSuggestionsFields = ({ handleFieldSelect, title = null, abstract = null }) => {
    const [fields, setFields] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getSuggestions = async () => {
            if (!title || !abstract) return;
            setIsLoading(true);
            const _fields = await classifyPaper({ smartSuggestionInputText: `${title} ${abstract}` });
            setFields(_fields.annotations);
            setIsLoading(false);
        };
        getSuggestions();
    }, [title, abstract]);

    const handleFieldLabelSelect = async (fieldLabel) => {
        const fieldResources = await getResources({ q: fieldLabel, include: [CLASSES.RESEARCH_FIELD], returnContent: true });

        if (fieldResources.length === 0) {
            toast.error('The selected research field does not exist in the ORKG. Please select a different field');
            return;
        }

        handleFieldSelect(
            {
                id: fieldResources[0]?.id,
                label: fieldResources[0]?.label,
            },
            true,
        );
    };

    return (
        (fields.length > 0 || isLoading) && (
            <SuggestionsBox className="mb-3 rounded p-2 px-3">
                <h3 className="fw-bold h6 mt-1">
                    <Tippy content="The listed smart suggestions are research fields based on the article's title and abstract (if available)">
                        <span>
                            Smart suggested fields <Icon icon={faQuestionCircle} className="text-primary" />
                        </span>
                    </Tippy>
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

SmartSuggestionsFields.propTypes = {
    handleFieldSelect: PropTypes.func.isRequired,
    title: PropTypes.string,
    abstract: PropTypes.string,
};

export default SmartSuggestionsFields;
