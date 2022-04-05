import { useEffect, useState, useCallback } from 'react';
import { getStatementsBundleBySubject } from 'services/backend/statements';
import { getIsVerified } from 'services/backend/papers';
import { getResource } from 'services/backend/resources';
import { useDispatch } from 'react-redux';
import { resetStatementBrowser } from 'actions/statementBrowser';
import { loadPaper, setPaperAuthors } from 'actions/viewPaper';
import { getPaperData_ViewPaper, filterObjectOfStatementsByPredicateAndClass, filterSubjectOfStatementsByPredicateAndClass } from 'utils';
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
            dispatch(
                setPaperAuthors({
                    authors: authorsArray
                })
            );
        },
        [dispatch]
    );

    const getResourceStatements = async (resourceId, data, list) => {
        const statement = data.find(d => d.subject.id === resourceId);
        console.log(statement);
        if (statement) {
            list.push(statement);
        } else {
            return list;
        }
        //const statements = await getStatementsBySubject({ id: resourceId });

        if (statement.object._class === 'resource') {
            //console.log(resourceId + '-' + statements.length);
            //list.push(...statements);
            //for (const statement of statements) {
            //console.log(statement);
            //if (statement.object._class === 'resource') {
            //console.log(true);
            await getResourceStatements(statement.object.id, data, list);
            //}
            //}
            return list;
        } else {
            return list;
        }
    };

    const loadPaperData = useCallback(() => {
        setIsLoading(true);
        dispatch(resetStatementBrowser());
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
                    console.log(pp);
                    const rrr = [];
                    rrr.push(...pp);
                    //setContributions(pp);
                    setContributions(rrr);
                    console.log(rrr);
                    const subjectId = pp[0].id;
                    //console.log(subjectId);
                    for (const r1 of r.data.statements) {
                        if (r1.subject.id === subjectId) {
                            //console.log(r1);
                            //console.log(await getResourceStatements(r1.object.id, r.data.statements, []));
                        }
                    }
                    //console.log(contributions);
                });
                Promise.all([
                    getStatementsBundleBySubject({ id: paperId, maxLevel: 2, blacklist: [CLASSES.RESEARCH_FIELD, CLASSES.CONTRIBUTION] })
                ]).then(([paperStatements]) => {
                    const paperData = getPaperData_ViewPaper(paperResource, paperStatements.statements?.filter(s => s.subject.id === paperId));
                    dispatch(loadPaper({ ...paperData }));
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
