import { useState, useEffect, useCallback } from 'react';
import { getObservatoriesByResearchFieldId, getObservatoriesStats, getUsersByObservatoryId } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { set, orderBy } from 'lodash';
import { useParams } from 'react-router-dom';

function useResearchFieldObservatories() {
    const [data, setData] = useState([]);
    const { researchFieldId } = useParams();
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isFailedLoadingData, setIsFailedLoadingData] = useState(true);

    const loadResearchFieldObservatories = useCallback(rfId => {
        if (rfId) {
            setIsLoadingData(true);

            const observatories = getObservatoriesByResearchFieldId(rfId);
            const obsStats = getObservatoriesStats();
            const organizations = getAllOrganizations();

            Promise.all([observatories, obsStats, organizations])
                .then(data => {
                    let observatoriesData = data[0]
                        .filter(ob => {
                            const obsStat = data[1].find(el => el.observatory_id === ob.id);
                            return obsStat && (obsStat.comparisons > 0 || obsStat.resources > 0);
                        })
                        .map(ob => {
                            //const contributors = await getUsersByObservatoryId(ob.id);
                            const obsStat = data[1].find(el => el.observatory_id === ob.id);
                            return { ...ob, ...obsStat, orgs: data[2].filter(o => ob.organization_ids.includes(o.id)) };
                        });
                    const cont = observatoriesData.map(o => getUsersByObservatoryId(o.id));
                    Promise.all(cont).then(c => {
                        observatoriesData = orderBy(
                            observatoriesData.map((o, index) => set(o, 'contributors', c[index])),
                            ['comparisons', 'resources'],
                            ['desc', 'desc']
                        );
                        setData(observatoriesData);
                        setIsLoadingData(false);
                        setIsFailedLoadingData(false);
                    });
                })
                .catch(e => {
                    setIsLoadingData(false);
                    setIsFailedLoadingData(true);
                });
        }
    }, []);

    useEffect(() => {
        if (researchFieldId !== undefined) {
            loadResearchFieldObservatories(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldObservatories]);
    return [data, isLoadingData, isFailedLoadingData];
}

export default useResearchFieldObservatories;
