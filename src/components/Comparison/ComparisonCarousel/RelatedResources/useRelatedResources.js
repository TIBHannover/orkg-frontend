import { ENTITIES } from 'constants/graphSettings';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getRelatedFiguresData, getRelatedResourcesData } from 'utils';

const useRelatedResources = () => {
    const figures = useSelector(state => state.comparison.comparisonResource.figures);
    const resources = useSelector(state => state.comparison.comparisonResource.resources);
    const [relatedResources, setRelatedResources] = useState([]);
    const [relatedFigures, setRelatedFigures] = useState([]);

    const loadResources = useCallback(() => {
        if (resources.length > 0) {
            const literalRelatedResources = resources
                .filter(r => r._class === ENTITIES.LITERAL)
                .map(resource => ({
                    url: resource.label,
                }));
            if (literalRelatedResources.length !== resources.length) {
                getStatementsBySubjects({
                    ids: resources.filter(r => r._class !== ENTITIES.LITERAL).map(r => r.id),
                }).then(resourcesStatements => {
                    setRelatedResources([...literalRelatedResources, ...getRelatedResourcesData(resourcesStatements)]);
                });
            } else {
                setRelatedResources(literalRelatedResources);
            }
        }
    }, [resources]);

    const loadFigures = useCallback(() => {
        if (figures.length === 0) {
            return;
        }
        // Fetch the data of each figure
        getStatementsBySubjects({
            ids: figures.map(r => r.id),
        })
            .then(figuresStatements => {
                setRelatedFigures(getRelatedFiguresData(figuresStatements));
            })
            .catch(() => {
                setRelatedFigures([]);
            });
    }, [figures]);

    useEffect(() => {
        loadResources();
        loadFigures();
    }, [loadFigures, loadResources]);

    return { relatedResources, relatedFigures };
};

export default useRelatedResources;
