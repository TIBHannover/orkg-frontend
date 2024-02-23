import { RESOURCES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { getObservatories } from 'services/backend/observatories';
import { Observatory } from 'services/backend/types';

function useResearchFieldObservatories({ researchFieldId }: { researchFieldId: string }) {
    const [data, setData] = useState<Observatory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isFailedLoading, setIsFailedLoading] = useState<boolean>(true);

    const loadResearchFieldObservatories = useCallback((rfId: string) => {
        if (rfId) {
            setIsLoading(true);
            const observatories = getObservatories({ researchFieldId: rfId !== RESOURCES.RESEARCH_FIELD_MAIN ? rfId : null }).then(
                res => res.content,
            );

            observatories
                .then(_data => {
                    setData(_data);
                    setIsLoading(false);
                    setIsFailedLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsFailedLoading(true);
                });
        }
    }, []);

    useEffect(() => {
        setData([]);
        if (researchFieldId !== undefined) {
            loadResearchFieldObservatories(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldObservatories]);

    return { observatories: data, isLoading, isFailedLoading };
}

export default useResearchFieldObservatories;
