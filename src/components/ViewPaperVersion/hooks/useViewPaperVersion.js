import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject, getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { loadPaper, setPaperAuthors } from 'slices/viewPaperSlice';
import { getPaperDataViewPaper, filterObjectOfStatementsByPredicateAndClass, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { getVisualization } from 'services/similarity';

const useViewPaperVersion = ({ paperId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingFailed, setIsLoadingFailed] = useState(false);
    const dispatch = useDispatch();
    const [contributions, setContributions] = useState([]);

    const setAuthorsORCID = useCallback(
        (paperStatements, pId) => {
            let authorsArray = [];
            const paperAuthors = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false, null, pId);
            for (const author of paperAuthors) {
                const orcid = paperStatements.find(s => s.subject.id === author.id && s.predicate.id === PREDICATES.HAS_ORCID);
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
                    const contributions = filterSubjectOfStatementsByPredicateAndClass(
                        r.data.statements,
                        PREDICATES.HAS_CONTRIBUTION,
                        false,
                        CLASSES.CONTRIBUTION,
                    );
                    // remove duplicates becasue contributions subject could be multiple
                    const pp = contributions.filter((ele, ind) => ind === contributions.findIndex(elem => elem.id === ele.id));
                    setContributions(pp.reverse());
                });
                Promise.all([
                    getStatementsBundleBySubject({ id: paperId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] }),
                ]).then(async ([paperStatements]) => {
                    const paperData = getPaperDataViewPaper(paperResource, paperStatements.statements?.filter(s => s.subject.id === paperId));
                    let statement = await getStatementsByObjectAndPredicate({ objectId: paperId, predicateId: PREDICATES.HAS_PREVIOUS_VERSION });
                    for (; !statement[0].subject.classes.find(s => s === CLASSES.PAPER);) {
                        statement = await getStatementsByObjectAndPredicate({
                            objectId: statement[0].subject.id,
                            predicateId: PREDICATES.HAS_PREVIOUS_VERSION,
                        });
                    }
                    dispatch(loadPaper({ ...paperData, originalPaperId: statement && statement[0].subject.id ? statement[0].subject.id : '' }));
                    setAuthorsORCID(paperStatements.statements, paperId);
                    setIsLoading(false);
                });
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
    };
};

export default useViewPaperVersion;
