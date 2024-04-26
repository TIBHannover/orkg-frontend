import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uniqBy } from 'lodash';
import { getRecommendedPredicates } from 'services/orkgNlp';
import { getExistingPredicatesByResource } from 'slices/statementBrowserSlice';
import { setPredicatesRawResponse } from 'slices/viewPaperSlice';
import env from 'components/NextJsMigration/env';

const usePredicatesRecommendation = ({ title, abstract }) => {
    const selectedResource = useSelector((state) => state.statementBrowser.selectedResource);
    const existingPropertyIds = useSelector((state) => getExistingPredicatesByResource(state, selectedResource));
    const dispatch = useDispatch();
    const [recommendedPredicates, setRecommendedPredicates] = useState([]);
    const [isLoadingRP, setIsLoadingRP] = useState(false);

    useEffect(() => {
        const fetchRecommendation = () => {
            // disable this feature in production
            if (env('NEXT_PUBLIC_IS_TESTING_SERVER') !== 'true') {
                return;
            }
            setIsLoadingRP(true);
            getRecommendedPredicates({ title, abstract })
                .then((result) => {
                    dispatch(setPredicatesRawResponse(result));
                    // We have to remove the semicolon that denotes an edge between two predicates that are supposed to be suggested as a path.
                    // https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/issues/1032#note_1123986048
                    setRecommendedPredicates(
                        result.predicates.map((p) => {
                            if (p.id.includes(';')) {
                                return { id: p.id.split(';')[0], label: p.label.split(';')[0] };
                            }
                            return p;
                        }),
                    );
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
        recommendedPredicates: uniqBy(
            recommendedPredicates.filter((x) => !existingPropertyIds.includes(x.id)),
            'id',
        ),
        isLoadingRP,
    };
};

export default usePredicatesRecommendation;
