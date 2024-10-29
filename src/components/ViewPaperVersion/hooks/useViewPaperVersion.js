import { CLASSES, PREDICATES } from 'constants/graphSettings';
import THING_TYPES from 'constants/thingTypes';
import { uniqBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getOriginalPaperId } from 'services/backend/papers';
import { getResource } from 'services/backend/resources';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getThing } from 'services/similarity';
import { loadPaper, setDataCiteDoi, setOriginalPaperId } from 'slices/viewPaperSlice';
import { convertPaperToNewFormat, filterSubjectOfStatementsByPredicateAndClass, getPaperDataViewPaper } from 'utils';

const useViewPaperVersion = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const dispatch = useDispatch();
    const [contributions, setContributions] = useState([]);
    const [paperStatements, setPaperStatements] = useState([]);

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        getResource(paperId)
            .then(async (paperResource) => {
                if (!paperResource.classes.includes(CLASSES.PAPER_VERSION)) {
                    setIsLoadingFailed(true);
                    setIsLoading(false);
                    return;
                }
                // Load the paper metadata but skip the research field and contribution data
                await getThing({ thingType: THING_TYPES.PAPER_VERSION, thingKey: paperId }).then(async (r) => {
                    setPaperStatements(r.data.statements);
                    const contributionsNodes = filterSubjectOfStatementsByPredicateAndClass(
                        r.data.statements,
                        PREDICATES.HAS_CONTRIBUTION,
                        false,
                        CLASSES.CONTRIBUTION,
                    );
                    setContributions(uniqBy(contributionsNodes, 'id').reverse());
                });
                // const paper = await getPaper(paperId);
                const pStatements = await getStatementsBundleBySubject({ id: paperId, maxLevel: 3, blacklist: [CLASSES.RESEARCH_FIELD] });
                const data = getPaperDataViewPaper(paperResource, pStatements.statements);
                const paper = convertPaperToNewFormat({ ...data, ...data.paperResource });
                dispatch(loadPaper(paper));
                dispatch(setDataCiteDoi(data.dataCiteDoi.label));

                const livePaperId = await getOriginalPaperId(paperId);
                dispatch(setOriginalPaperId(livePaperId));
                setIsLoading(false);
                document.title = paper.title;
            })
            .catch((e) => {
                console.error(e);
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
