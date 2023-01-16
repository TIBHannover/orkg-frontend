import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTemplateRecommendations } from 'services/orkgNlp';
import { differenceBy } from 'lodash';
import useUsedTemplates from 'components/StatementBrowser/TemplatesModal/hooks/useUsedTemplates';

const useTemplatesRecommendation = () => {
    const { title, abstract } = useSelector(state => state.addPaper);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const [recommendedTemplates, setRecommendedTemplates] = useState([]);
    const [isLoadingRT, setIsLoadingRT] = useState(false);
    const { usedTemplates } = useUsedTemplates({ resourceId: selectedResource });

    useEffect(() => {
        const fetchRecommendation = () => {
            setIsLoadingRT(true);
            getTemplateRecommendations({ title, abstract })
                .then(result => {
                    setRecommendedTemplates(result.templates);
                    setIsLoadingRT(false);
                })
                .catch(() => {
                    setRecommendedTemplates([]);
                    setIsLoadingRT(false);
                });
        };
        fetchRecommendation();
    }, [abstract, title]);

    return {
        recommendedTemplates: differenceBy(recommendedTemplates, usedTemplates, 'id'),
        isLoadingRT,
    };
};

export default useTemplatesRecommendation;
