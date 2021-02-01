import { useState, useEffect } from 'react';
import { getAllObservatories, getObservatoriesStats, getUsersByObservatoryId } from 'services/backend/observatories';
import { getAllOrganizations } from 'services/backend/organizations';
import { set, orderBy } from 'lodash';

function useObservatories() {
    const [observatories, setObservatories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        const observatories = getAllObservatories();
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
                    setObservatories(observatoriesData);
                    setIsLoading(false);
                });
            })
            .catch(e => {
                setIsLoading(false);
            });
    }, []);

    return [observatories, isLoading];
}

export default useObservatories;
