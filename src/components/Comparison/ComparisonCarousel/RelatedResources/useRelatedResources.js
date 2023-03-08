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
    const [isLoadingResources, setIsLoadingResources] = useState(false);
    const [isLoadingFigures, setIsLoadingFigures] = useState(false);

    const loadResources = useCallback(async () => {
        if (resources.length > 0) {
            const literalRelatedResources = resources
                .filter(r => r._class === ENTITIES.LITERAL)
                .map(resource => ({
                    url: resource.label,
                }));
            if (literalRelatedResources.length !== resources.length) {
                setIsLoadingResources(true);
                const resourcesStatements = await getStatementsBySubjects({
                    ids: resources.filter(r => r._class !== ENTITIES.LITERAL).map(r => r.id),
                });
                setRelatedResources([...literalRelatedResources, ...getRelatedResourcesData(resourcesStatements)]);
                setIsLoadingResources(false);
            } else {
                setRelatedResources(literalRelatedResources);
            }
        }
    }, [resources]);

    const loadFigures = useCallback(async () => {
        if (figures.length === 0) {
            return;
        }
        try {
            setIsLoadingFigures(true);
            const figuresStatements = await getStatementsBySubjects({
                ids: figures.map(r => r.id),
            });
            setRelatedFigures(getRelatedFiguresData(figuresStatements));
        } catch (e) {
            setRelatedFigures([]);
        } finally {
            setIsLoadingFigures(false);
        }
    }, [figures]);

    useEffect(() => {
        loadResources();
        loadFigures();
    }, [loadFigures, loadResources]);

    return { relatedResources, relatedFigures, isLoadingResources, isLoadingFigures };
};

export default useRelatedResources;
