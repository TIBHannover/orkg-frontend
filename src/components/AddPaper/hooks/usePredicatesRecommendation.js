import { PREDICATES } from 'constants/graphSettings';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecommendedPredicates } from 'services/orkgNlp';
import { getExistingPredicatesByResource } from 'slices/statementBrowserSlice';
import { setPredicatesRawResponse } from 'slices/addPaperSlice';

const usePredicatesRecommendation = () => {
    const { title, abstract } = useSelector(state => state.addPaper);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const existingPropertyIds = useSelector(state => getExistingPredicatesByResource(state, selectedResource));
    const dispatch = useDispatch();
    const [recommendedPredicates, setRecommendedPredicates] = useState([]);
    const [isLoadingRP, setIsLoadingRP] = useState([]);

    useEffect(() => {
        const fetchRecommendation = () => {
            setIsLoadingRP(true);
            getRecommendedPredicates({ title, abstract })
                .then(result => {
                    dispatch(setPredicatesRawResponse(result));
                    setRecommendedPredicates(result.predicates.filter(p => !p.id.includes(PREDICATES.SAME_AS)));
                    setIsLoadingRP(false);
                })
                .catch(() => {
                    setRecommendedPredicates([]);
                    setIsLoadingRP(false);
                });
        };
        fetchRecommendation();
    }, [abstract, dispatch, title]);

    return {
        recommendedPredicates: recommendedPredicates.filter(x => !existingPropertyIds.includes(x.id)),
        isLoadingRP,
    };
};

export default usePredicatesRecommendation;
