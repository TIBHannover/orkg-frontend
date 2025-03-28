'use client';

import { faExternalLinkAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { env } from 'next-runtime-env';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';

import AddContribution from '@/components/Comparison/AddContribution/AddContribution';
import TableScrollContainer from '@/components/Comparison/Table/TableScrollContainer';
import CreateProperty from '@/components/ContributionEditor/CreateProperty';
import EditorTable from '@/components/ContributionEditor/EditorTable';
import PropertySuggestions from '@/components/ContributionEditor/PropertySuggestions/PropertySuggestions';
import RelatedPapersCarousel from '@/components/ContributionEditor/RelatedPapers/RelatedPaperCarousel';
import useContributionEditor from '@/components/ContributionEditor/TableCellForm/hooks/useContributionEditor';
import TableLoadingIndicator from '@/components/ContributionEditor/TableLoadingIndicator';
import CreateContributionModal from '@/components/CreateContributionModal/CreateContributionModal';
import AddPaperModal from '@/components/PaperForm/AddPaperModal';
import TitleBar from '@/components/TitleBar/TitleBar';
import routes from '@/constants/routes';
import requireAuthentication from '@/requireAuthentication';
import { contributionsRemoved, loadContributions } from '@/slices/contributionEditorSlice';

const ContributionEditor = () => {
    const [isOpenAddContribution, setIsOpenAddContribution] = useState(false);
    const [isOpenCreateContribution, setIsOpenCreateContribution] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);
    const [createContributionPaperId, setCreateContributionPaperId] = useState(null);
    const [initialValueCreatePaper, setInitialValueCreatePaper] = useState(null);
    const { getContributionIds, handleAddContributions } = useContributionEditor();
    const contributions = useSelector((state) => state.contributionEditor.contributions);
    const isLoading = useSelector((state) => state.contributionEditor.isLoading);
    const hasFailed = useSelector((state) => state.contributionEditor.hasFailed);
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const contributionIds = getContributionIds();
    const numPWCStatement = useSelector(
        (state) =>
            Object.keys(state.contributionEditor?.statements).filter?.(
                (statementId) => state.contributionEditor?.statements[statementId]?.created_by === env('NEXT_PUBLIC_PWC_USER_ID'),
            )?.length ?? 0,
    );
    const comparisonId = searchParams.get('comparisonId');

    useEffect(() => {
        document.title = 'Contribution editor - ORKG';
    }, []);

    // handle changes of the query string param 'contributions'
    useEffect(() => {
        if (hasFailed || isLoading) {
            return;
        }
        // check if new contributions should be loaded
        const contributionIdsToLoad = contributionIds.filter((id) => !(id in contributions));
        if (contributionIdsToLoad.length) {
            dispatch(loadContributions(contributionIdsToLoad));
        }

        // check if contributions are removed
        const contributionIdsToRemove = Object.keys(contributions).filter((id) => !contributionIds.includes(id));
        if (contributionIdsToRemove.length) {
            dispatch(contributionsRemoved(contributionIdsToRemove));
        }
    }, [contributionIds, contributions, dispatch, hasFailed, isLoading]);

    const handleOpenCreateContributionModal = (paperId) => {
        setIsOpenAddContribution(false);
        setCreateContributionPaperId(paperId);
        setIsOpenCreateContribution(true);
    };

    const handleOpenCreatePaperModal = (initialValue) => {
        setIsOpenAddContribution(false);
        setIsOpenCreatePaper(true);
        setInitialValueCreatePaper(initialValue);
    };

    const handleCreateContribution = (id) => {
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
                            href={`${
                                comparisonId
                                    ? reverse(routes.COMPARISON, { comparisonId })
                                    : `${reverse(routes.COMPARISON_NOT_PUBLISHED)}?contributions=${contributionIds.join(',')}`
                            }`}
                            color="secondary"
                            size="sm"
                            style={{ marginRight: 2 }}
                            disabled={contributionAmount < 2}
                        >
                            View comparison
                        </Button>
                        <Button color="secondary" size="sm" onClick={() => setIsOpenAddContribution(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add contribution
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
                            paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
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
                    toggle={() => setIsOpenAddContribution((v) => !v)}
                    onAddContributions={handleAddContributions}
                    onCreateContribution={handleOpenCreateContributionModal}
                    onCreatePaper={handleOpenCreatePaperModal}
                />
            )}
            {isOpenCreateContribution && (
                <CreateContributionModal
                    isOpen
                    onCreateContribution={handleCreateContribution}
                    toggle={() => setIsOpenCreateContribution((v) => !v)}
                    paperId={createContributionPaperId}
                />
            )}
            {isOpenCreatePaper && (
                <AddPaperModal
                    isOpen
                    onCreatePaper={handleCreatePaper}
                    toggle={() => setIsOpenCreatePaper((v) => !v)}
                    initialValue={initialValueCreatePaper}
                />
            )}

            {!hasFailed && contributionAmount > 0 && (
                <Container>
                    <RelatedPapersCarousel handleAddContributions={handleAddContributions} contributionIds={contributionIds} />
                </Container>
            )}
        </>
    );
};

export default requireAuthentication(ContributionEditor);
