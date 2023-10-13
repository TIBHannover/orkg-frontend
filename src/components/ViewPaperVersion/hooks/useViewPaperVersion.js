import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { loadPaper } from 'slices/viewPaperSlice';
import { getPaperDataViewPaper, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { getVisualization } from 'services/similarity';
import { uniqBy } from 'lodash';
import { getOriginalPaperId } from 'services/backend/papers';

const useViewPaperVersion = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const dispatch = useDispatch();
    const [contributions, setContributions] = useState([]);
    const [paperStatements, setPaperStatements] = useState([]);

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        getResource(paperId)
            .then(async paperResource => {
                if (!paperResource.classes.includes(CLASSES.PAPER_VERSION)) {
                    setIsLoadingFailed(true);
                    setIsLoading(false);
                    return;
                }
                // Load the paper metadata but skip the research field and contribution data
                getVisualization(paperId).then(async r => {
                    setPaperStatements(r.data.statements);
                    const contributionsNodes = filterSubjectOfStatementsByPredicateAndClass(
                        r.data.statements,
                        PREDICATES.HAS_CONTRIBUTION,
                        false,
                        CLASSES.CONTRIBUTION,
                    );
                    setContributions(uniqBy(contributionsNodes, 'id').reverse());
                });
                const pStatements = await getStatementsBundleBySubject({ id: paperId, maxLevel: 3, blacklist: [CLASSES.RESEARCH_FIELD] });
                const paperData = getPaperDataViewPaper(paperResource, pStatements.statements);
                const livePaperId = await getOriginalPaperId(paperId);
                dispatch(loadPaper({ ...paperData, originalPaperId: livePaperId }));
                setIsLoading(false);
                document.title = paperData.paperResource.label;
            })
            .catch(() => {
                setIsLoadingFailed(true);
                setIsLoading(false);
            });
    }, [dispatch, paperId]);

    useEffect(() => {
        loadPaperData();
    }, [loadPaperData, paperId]);

    return {
        isLoading,
        isLoadingFailed,
        contributions,
        paperStatements,
    };
};

export default useViewPaperVersion;
