import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getComparisonVersionsById } from 'services/backend/comparisons';
import { setVersions } from 'slices/comparisonSlice';

function useComparisonVersions({ cId }) {
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [hasNextVersion, setHasNextVersion] = useState(false);
    const versions = useSelector(state => state.comparison.versions);
    const dispatch = useDispatch();

    const loadVersions = useCallback(
        id => {
            if (id && versions.length === 0) {
                setIsLoadingVersions(true);
                getComparisonVersionsById(id).then(v => {
                    dispatch(setVersions(v));
                    setIsLoadingVersions(false);
                    setHasNextVersion(!!(v?.length > 0 && v[0].id !== id));
                });
            }
        },
        [dispatch, versions.length],
    );

    useEffect(() => {
        loadVersions(cId);
    }, [cId, loadVersions]);

    return {
        versions,
        isLoadingVersions,
        hasNextVersion,
        loadVersions,
    };
}
export default useComparisonVersions;
