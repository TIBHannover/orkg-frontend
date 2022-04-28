import { faPlusCircle, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { contributionsRemoved, loadContributions } from 'slices/contributionEditorSlice';
import CreateProperty from 'components/ContributionEditor/CreateProperty';
import PropertySuggestions from 'components/ContributionEditor/PropertySuggestions/PropertySuggestions';
import EditorTable from 'components/ContributionEditor/EditorTable';
import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import TableLoadingIndicator from 'components/ContributionEditor/TableLoadingIndicator';
import AddContribution from 'components/Comparison/AddContribution/AddContribution';
import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import CreateContributionModal from 'components/CreateContributionModal/CreateContributionModal';
import CreatePaperModal from 'components/CreatePaperModal/CreatePaperModal';
import routes from 'constants/routes';
import { reverse } from 'named-urls';
import queryString from 'query-string';
import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import env from '@beam-australia/react-env';
import { Alert, Button, Container } from 'reactstrap';
import TitleBar from 'components/TitleBar/TitleBar';

const ContributionEditor = () => {
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenCreateContribution, setIsOpenCreateContribution] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [createContributionPaperId, setCreateContributionPaperId] = useState(null);
    const [initialValueCreatePaper, setInitialValueCreatePaper] = useState(null);
    const { getContributionIds, handleAddContributions } = useContributionEditor();
    const contributions = useSelector(state => state.contributionEditor.contributions);
    const isLoading = useSelector(state => state.contributionEditor.isLoading);
    const hasFailed = useSelector(state => state.contributionEditor.hasFailed);
    const dispatch = useDispatch();
    const location = useLocation();
    const contributionIds = getContributionIds();
    const numPWCStatement = useSelector(state => {
        return (
            Object.keys(state.contributionEditor?.statements).filter?.(
                statementId => state.contributionEditor?.statements[statementId]?.created_by === env('PWC_USER_ID')
            )?.length ?? 0
        );
    });
    const hasPreviousVersion = queryString.parse(location.search).hasPreviousVersion;

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
            dispatch(contributionsRemoved(contributionIdsToRemove));
        }
    }, [contributionIds, contributions, dispatch, hasFailed, isLoading]);

    const handleOpenCreateContributionModal = paperId => {
        setIsOpenAddContribution(false);
        setCreateContributionPaperId(paperId);
        setIsOpenCreateContribution(true);
    };

    const handleOpenCreatePaperModal = initialValue => {
        setIsOpenAddContribution(false);
        setIsOpenCreatePaper(true);
        setInitialValueCreatePaper(initialValue);
    };

    const handleCreateContribution = id => {
        handleAddContributions([id]);
        setIsOpenCreateContribution(false);
    };

    const handleCreatePaper = ({ contributionId }) => {
        handleAddContributions([contributionId]);
        setIsOpenCreatePaper(false);
    };

    const contributionAmount = contributionIds.length;
    const containerStyle = contributionAmount > 2 ? { maxWidth: 'calc(100% - 20px)' } : undefined;

    // if is loading and there are no contributions in the store, it means it is loading for the first time
    const isLoadingInit = Object.keys(contributions).length === 0 && isLoading;

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        <Button
                            tag={Link}
                            to={`${reverse(routes.COMPARISON)}?contributions=${contributionIds.join(',')}${
                                hasPreviousVersion ? `&hasPreviousVersion=${hasPreviousVersion}` : ''
                            }`}
                            color="secondary"
                            size="sm"
                            style={{ marginRight: 2 }}
                            disabled={contributionAmount < 2}
                        >
                            View comparison
                        </Button>
                        <Button color="secondary" size="sm" onClick={() => setIsOpenAddContribution(true)}>
                            <Icon icon={faPlusCircle} /> Add contribution
                        </Button>
                    </>
                }
            >
                Contribution editor
            </TitleBar>
            <Container className="box rounded p-4" style={containerStyle}>
                {!hasFailed && contributionAmount === 0 && (
                    <Alert color="info">
                        Start adding contributions by clicking the button <em>Add contribution</em> on the right
                    </Alert>
                )}
                {numPWCStatement > 0 && (
                    <Alert color="info">
                        Some contributions were imported from an external source and our provenance feature is in active development. Therefore, those
                        contributions cannot be edited. <br />
                        Meanwhile, you can visit{' '}
                        <a href="https://paperswithcode.com/" target="_blank" rel="noopener noreferrer">
                            paperswithcode <Icon icon={faExternalLinkAlt} className="me-1" />
                        </a>{' '}
                        website to suggest changes.
                    </Alert>
                )}
                {!hasFailed && isLoadingInit && <TableLoadingIndicator contributionAmount={contributionAmount} />}

                {!hasFailed && !isLoadingInit && contributionAmount > 0 && (
                    <>
                        <TableScrollContainer className="contribution-editor">
                            <EditorTable />
                        </TableScrollContainer>

                        <CreateProperty />

                        <PropertySuggestions />
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

            {isOpenCreatePaper && (
                <CreatePaperModal
                    isOpen
                    onCreatePaper={handleCreatePaper}
                    toggle={() => setIsOpenCreatePaper(v => !v)}
                    initialValue={initialValueCreatePaper}
                />
            )}
        </>
    );
};

export default ContributionEditor;
