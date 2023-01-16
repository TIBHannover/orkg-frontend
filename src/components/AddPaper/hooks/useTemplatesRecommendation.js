import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTemplateRecommendations } from 'services/orkgNlp';
import { setTemplatesRawResponse } from 'slices/addPaperSlice';
import { differenceBy } from 'lodash';
import useUsedTemplates from 'components/StatementBrowser/TemplatesModal/hooks/useUsedTemplates';
// import env from '@beam-australia/react-env';

const useTemplatesRecommendation = () => {
    const { title, abstract } = useSelector(state => state.addPaper);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const dispatch = useDispatch();
    const [recommendedTemplates, setRecommendedTemplates] = useState([]);
    const [isLoadingRT, setIsLoadingRT] = useState(false);
    const { usedTemplates } = useUsedTemplates({ resourceId: selectedResource });

    useEffect(() => {
        const fetchRecommendation = () => {
            // disable this feature in production
            // if (env('IS_TESTING_SERVER') !== 'true') {
            //    return;
            // }
            setIsLoadingRT(true);
            getTemplateRecommendations({ title, abstract })
                .then(result => {
                    dispatch(setTemplatesRawResponse(result));
                    setRecommendedTemplates(result.templates);
                    setIsLoadingRT(false);
                })
                .catch(() => {
                    setRecommendedTemplates([]);
                    setIsLoadingRT(false);
                });
        };
        fetchRecommendation();
    }, [abstract, dispatch, title]);

    return {
        recommendedTemplates: differenceBy(recommendedTemplates, usedTemplates, 'id'),
        isLoadingRT,
    };
};

export default useTemplatesRecommendation;
