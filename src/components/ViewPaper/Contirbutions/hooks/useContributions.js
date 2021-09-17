import { useEffect, useState } from 'react';
import { createResourceStatement, deleteStatementById } from 'services/backend/statements';
import { updateResource, createResource } from 'services/backend/resources';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { updateContributionLabel } from 'actions/statementBrowser';
import { toast } from 'react-toastify';
import Confirm from 'reactstrap-confirm';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { getResource } from 'services/backend/resources';
import { getSimilarContribution } from 'services/similarity/index';
import { selectContribution, updateResearchProblems, setPaperContributions } from 'actions/viewPaper';

const useContributions = ({ paperId, contributionId }) => {
    const [similarContributions, setSimilarContributions] = useState([]);
    const [isSimilarContributionsLoading, setIsSimilarContributionsLoading] = useState(true);
    const [isSimilarContributionsFailedLoading, setIsSimilarContributionsFailedLoading] = useState(false);
    const contributions = useSelector(state => state.viewPaper.contributions);
    const [selectedContribution, setSelectedContribution] = useState(contributionId);
    const paperResource = useSelector(state => state.viewPaper.paperResource);
    const dispatch = useDispatch();
    const researchProblems = useSelector(state =>
        state.viewPaper.researchProblems[selectedContribution] && state.viewPaper.researchProblems[selectedContribution].length > 0
            ? state.viewPaper.researchProblems[selectedContribution]
            : []
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);

    const [, setContributions] = useState([]);
    const history = useHistory();

    useEffect(() => {
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
    }, [contributionId, contributions, selectedContribution]);

    useEffect(() => {
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
            getSimilarContribution(selectedContribution)
                .then(sContributions => {
                    const sContributionsData = sContributions.map(paper => {
                        // Fetch the data of each paper
                        return getResource(paper.paperId).then(paperResource => {
                            paper.title = paperResource.label;
                            return paper;
                        });
                    });
                    Promise.all(sContributionsData).then(results => {
                        setSimilarContributions(results);
                        setIsSimilarContributionsLoading(false);
                        setIsSimilarContributionsFailedLoading(false);
                    });
                })
                .catch(error => {
                    setSimilarContributions([]);
                    setIsSimilarContributionsLoading(false);
                    setIsSimilarContributionsFailedLoading(true);
                });
            setIsLoading(false);
        };
        handleSelectContribution(selectedContribution);
    }, [contributions, dispatch, selectedContribution]);

    // @param sync : to update the contribution label on the backend.
    const handleChangeContributionLabel = async (contributionId, label) => {
        //find the index of contribution
        const objIndex = contributions.findIndex(obj => obj.id === contributionId);
        if (contributions[objIndex].label !== label) {
            // set the label of the contribution
            const updatedObj = { ...contributions[objIndex], label: label };
            // update the contributions array
            const newContributions = [...contributions.slice(0, objIndex), updatedObj, ...contributions.slice(objIndex + 1)];
            dispatch(setPaperContributions(newContributions));
            dispatch(updateContributionLabel({ id: contributionId, label: label }));
            await updateResource(contributionId, label);
            toast.success('Contribution name updated successfully');
        }
    };

    const handleCreateContribution = async () => {
        const newContribution = await createResource(`Contribution ${contributions.length + 1}`, [CLASSES.CONTRIBUTION]);
        const statement = await createResourceStatement(paperId, PREDICATES.HAS_CONTRIBUTION, newContribution.id);
        dispatch(setPaperContributions([...contributions, { ...statement.object, statementId: statement.id }]));
        toast.success('Contribution created successfully');
    };

    const toggleDeleteContribution = async contributionId => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this contribution?',
            cancelColor: 'light'
        });

        if (result) {
            const objIndex = contributions.findIndex(obj => obj.id === contributionId);
            const statementId = contributions[objIndex].statementId;
            const newContributions = contributions.filter(function(contribution) {
                return contribution.id !== contributionId;
            });
            history.push(
                reverse(ROUTES.VIEW_PAPER, {
                    resourceId: paperId,
                    contributionId: newContributions[0].id
                })
            );
            dispatch(setPaperContributions(newContributions));
            setContributions(newContributions);
            await deleteStatementById(statementId);
            toast.success('Contribution deleted successfully');
        }
    };

    const handleResearchProblemsChange = async (problemsArray, a) => {
        problemsArray = problemsArray ? problemsArray : [];
        if (a.action === 'select-option') {
            const statement = await createResourceStatement(selectedContribution, PREDICATES.HAS_RESEARCH_PROBLEM, a.option.id);
            //find the index of research problem
            const objIndex = problemsArray.findIndex(obj => obj.id === a.option.id);
            // set the statement of the research problem
            const updatedObj = { ...problemsArray[objIndex], statementId: statement.id };
            // update the research problem array
            problemsArray = [...problemsArray.slice(0, objIndex), updatedObj, ...problemsArray.slice(objIndex + 1)];
            toast.success('Research problem added successfully');
        } else if (a.action === 'create-option') {
            const newResource = await createResource(a.createdOptionLabel, [CLASSES.PROBLEM]);
            const statement = await createResourceStatement(selectedContribution, PREDICATES.HAS_RESEARCH_PROBLEM, newResource.id);
            //find the index of research problem
            const objIndex = problemsArray.findIndex(obj => obj.id === a.createdOptionId);
            // set the statement of the research problem
            const updatedObj = { ...problemsArray[objIndex], statementId: statement.id, id: newResource.id };
            // update the research problem array
            problemsArray = [...problemsArray.slice(0, objIndex), updatedObj, ...problemsArray.slice(objIndex + 1)];
            toast.success('Research problem added successfully');
        } else if (a.action === 'remove-value') {
            await deleteStatementById(a.removedValue.statementId);
            toast.success('Research problem deleted successfully');
        }
        dispatch(
            updateResearchProblems({
                problemsArray,
                contributionId: selectedContribution
            })
        );
    };

    return {
        isLoading,
        isLoadingContributionFailed,
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
        selectedContribution,
        contributions,
        researchProblems,
        paperTitle: paperResource.label,
        handleChangeContributionLabel,
        handleCreateContribution,
        toggleDeleteContribution,
        handleResearchProblemsChange
    };
};

export default useContributions;
