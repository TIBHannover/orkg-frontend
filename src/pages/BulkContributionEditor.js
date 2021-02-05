import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import EditorTable from 'components/BulkContributionEditor/EditorTable';
import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import CreateContributionModal from 'components/CreateContributionModal/CreateContributionModal';
import CreatePaperModal from 'components/CreatePaperModal/CreatePaperModal';
import { useEffect, useState } from 'react';
import { Alert, Button, Container } from 'reactstrap';

const BulkContributionEditor = () => {
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenCreateContribution, setIsOpenCreateContribution] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [createContributionPaperId, setCreateContributionPaperId] = useState(null);
    const { contributionIds, handleAddContributions, handleRemoveContribution, contributions } = useBulkContributionEditor();

    useEffect(() => {
        document.title = 'Bulk contribution editor - ORKG';
    }, []);

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

    return (
        <>
            <Container>
                <h1 className="h4 mt-4 mb-4">Bulk contribution editor</h1>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <div className="d-flex justify-content-end mb-3">
                    <Button color="lightblue" onClick={() => setIsOpenAddContribution(true)}>
                        <Icon icon={faPlusCircle} className="text-darkblue" /> Add contribution
                    </Button>
                </div>
                {contributionIds.length === 0 && <Alert color="info">Start adding contributions by clicking the button on the right</Alert>}
                {contributionIds.map(id => (
                    <div key={id}>
                        {id} <Button onClick={() => handleRemoveContribution(id)}>X</Button>
                        <br />
                    </div>
                ))}
                <EditorTable data={contributions} />
            </Container>

            {/* Used conditions to show the modals, to reset the components after closing */}
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
