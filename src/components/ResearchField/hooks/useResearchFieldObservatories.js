import { RESOURCES } from 'constants/graphSettings';
import { orderBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { getAllObservatories, getObservatoriesByResearchFieldId } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { getObservatoriesStats } from 'services/backend/stats';

function useResearchFieldObservatories({ researchFieldId }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFailedLoading, setIsFailedLoading] = useState(true);

    const loadResearchFieldObservatories = useCallback(
        rfId => {
            if (rfId) {
                setIsLoading(true);
                let obsCalls;
                if (researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN) {
                    const observatories = getObservatoriesByResearchFieldId({ id: rfId }).then(res => res.content);
                    const obsStats = getObservatoriesStats({}).then(res => res.content);
                    const organizations = getAllOrganizations();

                    obsCalls = Promise.all([observatories, obsStats, organizations]);
                } else {
                    const observatories = getAllObservatories({}).then(res => res.content);
                    const obsStats = getObservatoriesStats({}).then(res => res.content);
                    const organizations = getAllOrganizations();

                    obsCalls = Promise.all([observatories, obsStats, organizations]);
                }

                obsCalls
                    .then(_data => {
                        let observatoriesData;
                        if (researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN) {
                            observatoriesData = _data[0].map(ob => {
                                const obsStat = _data[1].find(el => el.observatory_id === ob.id);
                                return { ...ob, ...obsStat, orgs: _data[2].filter(o => ob.organization_ids.includes(o.id)) };
                            });
                        } else {
                            observatoriesData = _data[0]
                                .filter(ob => {
                                    const obsStat = _data[1].find(el => el.observatory_id === ob.id);
                                    return obsStat && (obsStat.comparisons > 0 || obsStat.papers > 0);
                                })
                                .map(ob => {
                                    const obsStat = _data[1].find(el => el.observatory_id === ob.id);
                                    return { ...ob, ...obsStat, orgs: _data[2].filter(o => ob.organization_ids.includes(o.id)) };
                                });
                        }
                        setData(orderBy(observatoriesData, ['comparisons', 'papers'], ['desc', 'desc']));
                        setIsLoading(false);
                        setIsFailedLoading(false);
                    })
                    .catch(e => {
                        setIsLoading(false);
                        setIsFailedLoading(true);
                    });
            }
        },
        [researchFieldId],
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
