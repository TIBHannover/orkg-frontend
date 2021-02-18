import { faPlusCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { loadContributions, removeContributions } from 'actions/bulkContributionEditor';
import CreateProperty from 'components/BulkContributionEditor/CreateProperty';
import EditorTable from 'components/BulkContributionEditor/EditorTable';
import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import CreateContributionModal from 'components/CreateContributionModal/CreateContributionModal';
import CreatePaperModal from 'components/CreatePaperModal/CreatePaperModal';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';

const BulkContributionEditor = () => {
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenCreateContribution, setIsOpenCreateContribution] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [createContributionPaperId, setCreateContributionPaperId] = useState(null);
    const { getContributionIds, handleAddContributions } = useBulkContributionEditor();
    const contributions = useSelector(state => state.bulkContributionEditor.contributions);
    const isLoading = useSelector(state => state.bulkContributionEditor.isLoading);
    const dispatch = useDispatch();
    const contributionIds = getContributionIds();

    useEffect(() => {
        document.title = 'Bulk contribution editor - ORKG';
    }, []);

    // handle changes of the query string param 'contributions'
    useEffect(() => {
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
    }, [contributionIds, contributions, dispatch]);

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

    const contributionAmount = Object.keys(contributions).length;
    const containerStyle = { maxWidth: contributionAmount > 3 ? 'fit-content' : undefined };
    return (
        <>
            <Container>
                <div className="d-flex mt-4 mb-4 align-items-center">
                    <h1 className="h4">Bulk contribution editor</h1> {isLoading && <Icon icon={faSpinner} spin className="ml-2" />}
                </div>
            </Container>
            <Container className="box rounded p-4" style={containerStyle}>
                <div className="d-flex justify-content-end mb-3">
                    <Button color="lightblue" onClick={() => setIsOpenAddContribution(true)}>
                        <Icon icon={faPlusCircle} className="text-darkblue" /> Add contribution
                    </Button>
                </div>
                {contributionIds.length === 0 && <Alert color="info">Start adding contributions by clicking the button on the right</Alert>}
                <TableScrollContainer className="bulk-editor">
                    <EditorTable />
                </TableScrollContainer>
                <CreateProperty />
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

export default BulkContributionEditor;
