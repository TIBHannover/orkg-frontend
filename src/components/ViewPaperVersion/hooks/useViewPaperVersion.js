import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { loadPaper, setPaperAuthors } from 'actions/viewPaper';
import { getPaperData_ViewPaper, filterObjectOfStatementsByPredicateAndClass, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { getVisualization } from 'services/similarity';
import { getStatementsByObject } from 'services/backend/statements';

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
            dispatch(
                setPaperAuthors({
                    authors: authorsArray
                })
            );
        },
        [dispatch]
    );

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        //dispatch(resetStatementBrowser());
        getResource(paperId)
            .then(paperResource => {
                if (!paperResource.classes.includes(PREDICATES.PAPER_VERSION)) {
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
                        CLASSES.CONTRIBUTION
                    );
                    const pp = contributions.filter((ele, ind) => ind === contributions.findIndex(elem => elem.id === ele.id));
                    //console.log(pp.reverse());
                    const rrr = [];
                    rrr.push(...pp);
                    setContributions(pp.reverse());
                });
                Promise.all([
                    getStatementsBundleBySubject({ id: paperId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] })
                ]).then(([paperStatements]) => {
                    const paperData = getPaperData_ViewPaper(paperResource, paperStatements.statements?.filter(s => s.subject.id === paperId));
                    Promise.all([getStatementsByObject({ id: paperId })]).then(([statements]) => {
                        const paperId = statements && statements.find(stmt => stmt.subject.classes.find(s => s === CLASSES.PAPER));
                        dispatch(loadPaper({ ...paperData, originalPaperId: paperId ? paperId.subject.id : '' }));
                    });
                    setIsLoading(false);
                    setAuthorsORCID(paperStatements.statements, paperId);
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
        contributions
    };
};

export default useViewPaperVersion;
