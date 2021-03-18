import { useState, useEffect, useCallback } from 'react';
import {
    getAllObservatories,
    getObservatoriesByResearchFieldId,
    getObservatoriesStats,
    getUsersByObservatoryId
} from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { MISC } from 'constants/graphSettings';
import { set, orderBy } from 'lodash';

function useResearchFieldObservatories({ researchFieldId }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFailedLoading, setIsFailedLoading] = useState(true);

    const loadResearchFieldObservatories = useCallback(
        rfId => {
            if (rfId) {
                setIsLoading(true);
                let obsCalls;
                if (researchFieldId !== MISC.RESEARCH_FIELD_MAIN) {
                    const observatories = getObservatoriesByResearchFieldId(rfId);
                    const obsStats = getObservatoriesStats();
                    const organizations = getAllOrganizations();

                    obsCalls = Promise.all([observatories, obsStats, organizations]);
                } else {
                    const observatories = getAllObservatories();
                    const obsStats = getObservatoriesStats();
                    const organizations = getAllOrganizations();

                    obsCalls = Promise.all([observatories, obsStats, organizations]);
                }

                obsCalls
                    .then(data => {
                        let observatoriesData;
                        if (researchFieldId !== MISC.RESEARCH_FIELD_MAIN) {
                            observatoriesData = data[0].map(ob => {
                                const obsStat = data[1].find(el => el.observatory_id === ob.id);
                                return { ...ob, ...obsStat, orgs: data[2].filter(o => ob.organization_ids.includes(o.id)) };
                            });
                        } else {
                            observatoriesData = data[0]
                                .filter(ob => {
                                    const obsStat = data[1].find(el => el.observatory_id === ob.id);
                                    return obsStat && (obsStat.comparisons > 0 || obsStat.resources > 0);
                                })
                                .map(ob => {
                                    const obsStat = data[1].find(el => el.observatory_id === ob.id);
                                    return { ...ob, ...obsStat, orgs: data[2].filter(o => ob.organization_ids.includes(o.id)) };
                                });
                        }
                        const cont = observatoriesData.map(o => getUsersByObservatoryId(o.id));
                        Promise.all(cont).then(c => {
                            observatoriesData = orderBy(
                                observatoriesData.map((o, index) => set(o, 'contributors', c[index])),
                                ['comparisons', 'resources'],
                                ['desc', 'desc']
                            );
                            setData(observatoriesData);
                            setIsLoading(false);
                            setIsFailedLoading(false);
                        });
                    })
                    .catch(e => {
                        setIsLoading(false);
                        setIsFailedLoading(true);
                    });
            }
        },
        [researchFieldId]
    );

    useEffect(() => {
        setData([]);
        if (researchFieldId !== undefined) {
            loadResearchFieldObservatories(researchFieldId);
        }
    }, [researchFieldId, loadResearchFieldObservatories]);
    return [data, isLoading, isFailedLoading];
}

export default useResearchFieldObservatories;
