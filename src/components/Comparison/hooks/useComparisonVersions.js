import { useEffect, useState, useCallback } from 'react';
import { getComparisonVersionsById } from 'services/backend/comparisons';

function useComparisonVersions({ cId }) {
    const [isLoadingVersions, setIsLoadingVersions] = useState(false);
    const [versions, setVersions] = useState([]);
    const [hasNextVersion, setHasNextVersion] = useState(false);

    const loadVersions = useCallback(id => {
        if (id) {
            setIsLoadingVersions(true);
            getComparisonVersionsById(id).then(v => {
                setVersions(v);
                setIsLoadingVersions(false);
                setHasNextVersion(v?.length > 0 && v[0].id !== id ? true : false);
            });
        }
    }, []);

    useEffect(() => {
        loadVersions(cId);
    }, [cId, loadVersions]);

    return {
        versions,
        isLoadingVersions,
        hasNextVersion,
        loadVersions
    };
}
export default useComparisonVersions;
