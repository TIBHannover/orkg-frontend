import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { loadPaper, setPaperAuthors } from 'slices/viewPaperSlice';
import { getPaperDataViewPaper, filterObjectOfStatementsByPredicateAndClass, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
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

    const setAuthorsORCID = useCallback(
        (pStatements, pId) => {
            let authorsArray = [];
            const paperAuthors = filterObjectOfStatementsByPredicateAndClass(pStatements, PREDICATES.HAS_AUTHOR, false, null, pId);
            for (const author of paperAuthors) {
                const orcid = pStatements.find(s => s.subject.id === author.id && s.predicate.id === PREDICATES.HAS_ORCID);
                if (orcid) {
                    authorsArray.push({ ...author, orcid: orcid.object.label });
                } else {
                    authorsArray.push({ ...author, orcid: '' });
                }
            }
            authorsArray = authorsArray.length ? authorsArray.sort((a, b) => a.s_created_at.localeCompare(b.s_created_at)) : [];
            dispatch(setPaperAuthors(authorsArray));
        },
        [dispatch],
    );

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        getResource(paperId)
            .then(paperResource => {
                if (!paperResource.classes.includes(CLASSES.PAPER_VERSION)) {
                    setIsLoadingFailed(true);
                    setIsLoading(false);
                    return;
                }
                // Load the paper metadata but skip the research field and contribution data
                getVisualization(paperId).then(async r => {
                    setPaperStatements(r.data.statements);
                    const cntrbs = filterSubjectOfStatementsByPredicateAndClass(
                        r.data.statements,
                        PREDICATES.HAS_CONTRIBUTION,
                        false,
                        CLASSES.CONTRIBUTION,
                    );
                    // const pp = ctrbs.filter((ele, ind) => ind === ctrbs.findIndex(elem => elem.id === ele.id));
                    const pp = uniqBy(cntrbs);
                    setContributions(pp.reverse());
                });
                getStatementsBundleBySubject({ id: paperId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] }).then(
                    async pStatements => {
                        const paperData = getPaperDataViewPaper(paperResource, pStatements.statements?.filter(s => s.subject.id === paperId));
                        const livePaperId = await getOriginalPaperId(paperId);
                        dispatch(loadPaper({ ...paperData, originalPaperId: livePaperId }));
                        setAuthorsORCID(pStatements.statements, paperId);
                        setIsLoading(false);
                        document.title = paperData.paperResource.label;
                    },
                );
            })
            .catch(error => {
                setIsLoadingFailed(true);
                setIsLoading(false);
            });
    }, [dispatch, paperId, setAuthorsORCID]);

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
