import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import { groupBy, uniqBy } from 'lodash';
import { env } from 'next-runtime-env';
import { useDispatch } from 'react-redux';
import { getRecommendedPredicates, nlpServiceUrl } from 'services/orkgNlp';
import { setPredicatesRawResponse } from 'slices/viewPaperSlice';
import useSWR from 'swr';

const usePredicatesRecommendation = () => {
    const dispatch = useDispatch();
    const { context, newProperties } = useDataBrowserState();
    const { title, abstract } = context;
    const { entity, statements } = useEntity();
    const scopedNewProperties = entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];

    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];

    // disable this feature in production
    const isDisabledFeature = env('NEXT_PUBLIC_IS_TESTING_SERVER') !== 'true' || (!abstract && !title);

    const { data: _recommendedPredicates, isLoading: isLoadingRP } = useSWR(
        !isDisabledFeature ? [{ title, abstract }, nlpServiceUrl, 'getRecommendedPredicates'] : null,
        ([_params]) => getRecommendedPredicates(_params),
    );

    const recommendedPredicates =
        _recommendedPredicates?.predicates.map((p) => {
            if (p.id.includes(';')) {
                return { id: p.id.split(';')[0], label: p.label.split(';')[0] };
            }
            return p;
        }) ?? [];

    if (!isLoadingRP && _recommendedPredicates) {
        dispatch(setPredicatesRawResponse(_recommendedPredicates));
    }

    return {
        isDisabledFeature,
        recommendedPredicates:
            uniqBy(
                recommendedPredicates.filter((x) => !existingProperties.includes(x.id)),
                'id',
            ) ?? [],
        isLoadingRP,
    };
};

export default usePredicatesRecommendation;
