import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { filterSubjectOfStatementsByPredicateAndClass } from 'utils';
import { getVisualization } from 'services/similarity';

const useContributions = ({ paperId, contributionId }) => {
    const [similarContributions, setSimilarContributions] = useState([]);
    const [isSimilarContributionsLoading, setIsSimilarContributionsLoading] = useState(true);
    const [isSimilarContributionsFailedLoading, setIsSimilarContributionsFailedLoading] = useState(false);
    const contributions = useSelector(state => state.viewPaper.contributions);
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const dispatch = useDispatch();
    const [contributionData, setContributionData] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    const [, setContributions] = useState([]);
    const history = useHistory();

    /*useEffect(() => {
        if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
            try {
                // apply selected contribution
                if (
                    contributionId &&
                    !contributions.some(el => {
                        return el.id === contributionId;
                    })
                ) {
                    throw new Error('Contribution not found');
                }
                const selected =
                    contributionId &&
                    contributions.some(el => {
                        return el.id === contributionId;
                    })
                        ? contributionId
                        : contributions[0].id;
                setSelectedContribution(selected);
            } catch (error) {
                console.log(error);
                setLoadingContributionFailed(true);
            }
        }
    }, [contributionId, contributions, selectedContribution]);*/

    /*useEffect(() => {
        const handleSelectContribution = contributionId => {
            setIsSimilarContributionsLoading(true);
            setIsLoading(true);
            // get the contribution label
            const contributionResource = contributions.find(c => c.id === selectedContribution);
            if (contributionResource) {
                setLoadingContributionFailed(false);
                dispatch(
                    selectContribution({
                        contributionId,
                        contributionLabel: contributionResource.label
                    })
                );
            } else {
                setLoadingContributionFailed(true);
            }
        };
        handleSelectContribution(selectedContribution);
    }, [contributions, dispatch, selectedContribution]);*/

    const getResourceStatements = async (resourceId, data, list) => {
        const statement = data.find(d => d.subject.id === resourceId);
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

    useEffect(() => {
        getVisualization('R141003').then(async r => {
            setIsLoading(true);
            console.log(contributionId);
            //console.log(r.data.statements);
            const contributions = filterSubjectOfStatementsByPredicateAndClass(
                r.data.statements,
                PREDICATES.HAS_CONTRIBUTION,
                false,
                CLASSES.CONTRIBUTION
            );
            const pp = contributions.filter((ele, ind) => ind === contributions.findIndex(elem => elem.id === ele.id));
            setContributions(pp);
            const subjectId = pp[0].id;
            //console.log(subjectId);
            const list = [];
            for (const r1 of r.data.statements) {
                if (r1.subject.id === subjectId) {
                    //console.log(r1);
                    list.push(r1);
                    //console.log(await getResourceStatements(r1.object.id, r.data.statements, []));
                    const response = await getResourceStatements(r1.object.id, r.data.statements, []);
                    list.push(...response);
                }
            }
            console.log(list);
            setIsLoading(false);
            setContributionData(list);
            //console.log(contributions);
        });
    }, [contributionId, contributions, selectedContribution]);

    return {
        isLoading,
        isLoadingContributionFailed,
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
        selectedContribution,
        contributions,
        paperTitle: paperResource.label,
        contributionData
    };
};

export default useContributions;
