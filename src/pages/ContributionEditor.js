import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { loadContributions, removeContributions } from 'actions/contributionEditor';
import CreateProperty from 'components/ContributionEditor/CreateProperty';
import EditorTable from 'components/ContributionEditor/EditorTable';
import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import TableLoadingIndicator from 'components/ContributionEditor/TableLoadingIndicator';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import CreateContributionModal from 'components/CreateContributionModal/CreateContributionModal';
import CreatePaperModal from 'components/CreatePaperModal/CreatePaperModal';
import routes from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Alert, Button, ButtonGroup, Container } from 'reactstrap';

const ContributionEditor = () => {
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenCreateContribution, setIsOpenCreateContribution] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [createContributionPaperId, setCreateContributionPaperId] = useState(null);
    const { getContributionIds, handleAddContributions } = useContributionEditor();
    const contributions = useSelector(state => state.contributionEditor.contributions);
    const isLoading = useSelector(state => state.contributionEditor.isLoading);
    const hasFailed = useSelector(state => state.contributionEditor.hasFailed);
    const dispatch = useDispatch();
    const contributionIds = getContributionIds();

    useEffect(() => {
        document.title = 'Contribution editor - ORKG';
    }, []);

    // handle changes of the query string param 'contributions'
    useEffect(() => {
        if (hasFailed || isLoading) {
            return;
        }
        // check if new contributions should be loaded
        const contributionIdsToLoad = contributionIds.filter(id => !(id in contributions));
        if (contributionIdsToLoad.length) {
            dispatch(loadContributions(contributionIdsToLoad));
        }

        // check if contributions are removed
        const contributionIdsToRemove = Object.keys(contributions).filter(id => !contributionIds.includes(id));
        if (contributionIdsToRemove.length) {
            dispatch(removeContributions(contributionIdsToRemove));
        }
    }, [contributionIds, contributions, dispatch, hasFailed, isLoading]);

    const handleOpenCreateContributionModal = paperId => {
        setIsOpenAddContribution(false);
        setCreateContributionPaperId(paperId);
        setIsOpenCreateContribution(true);
    };

    const handleOpenCreatePaperModal = () => {
        setIsOpenAddContribution(false);
        setIsOpenCreatePaper(true);
    };

    const handleCreateContribution = id => {
        handleAddContributions([id]);
        setIsOpenCreateContribution(false);
    };

    const handleCreatePaper = contributionId => {
        handleAddContributions([contributionId]);
        setIsOpenCreatePaper(false);
    };

    const contributionAmount = contributionIds.length;
    const containerStyle = contributionAmount > 3 ? { maxWidth: 'calc(100% - 20px)' } : undefined;

    // if is loading and there are no contributions in the store, it means it is loading for the first time
    const isLoadingInit = Object.keys(contributions).length === 0 && isLoading;

    return (
        <>
            <Container className="d-flex align-items-center">
                <div className="d-flex mt-4 mb-4 align-items-center flex-grow-1">
                    <h1 className="h4 m-0">Contribution editor</h1>
                </div>
                <ButtonGroup>
                    <Button
                        tag={Link}
                        to={`${reverse(routes.COMPARISON)}?contributions=${contributionIds.join(',')}`}
                        color="darkblue"
                        size="sm"
                        style={{ marginRight: 2 }}
                        disabled={contributionAmount < 2}
                    >
                        Make comparison
                    </Button>

                    <Button color="darkblue" size="sm" onClick={() => setIsOpenAddContribution(true)}>
                        <Icon icon={faPlusCircle} /> Add contribution
                    </Button>
                </ButtonGroup>
            </Container>
            <Container className="box rounded p-4" style={containerStyle}>
                {!hasFailed && contributionAmount === 0 && (
                    <Alert color="info">
                        Start adding contributions by clicking the button <em>Add contribution</em> on the right
                    </Alert>
                )}

                {!hasFailed && isLoadingInit && <TableLoadingIndicator contributionAmount={contributionAmount} />}

                {!hasFailed && !isLoadingInit && contributionAmount > 0 && (
                    <>
                        <TableScrollContainer className="contribution-editor">
                            <EditorTable />
                        </TableScrollContainer>

                        <CreateProperty />
                    </>
                )}
                {hasFailed && <Alert color="danger">An error has occurred while loading the specified contributions</Alert>}
            </Container>

            {isOpenAddContribution && (
                <AddContribution
                    allowCreate
                    showDialog
                    toggle={() => setIsOpenAddContribution(v => !v)}
                    onAddContributions={handleAddContributions}
                    onCreateContribution={handleOpenCreateContributionModal}
                    onCreatePaper={handleOpenCreatePaperModal}
                />
            )}

            {isOpenCreateContribution && (
                <CreateContributionModal
                    isOpen
                    onCreateContribution={handleCreateContribution}
                    toggle={() => setIsOpenCreateContribution(v => !v)}
                    paperId={createContributionPaperId}
                />
            )}

            {isOpenCreatePaper && <CreatePaperModal isOpen onCreatePaper={handleCreatePaper} toggle={() => setIsOpenCreatePaper(v => !v)} />}
        </>
    );
};

export default ContributionEditor;
