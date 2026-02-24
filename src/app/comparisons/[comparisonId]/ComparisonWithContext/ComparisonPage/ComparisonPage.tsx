'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import { useComparisonState } from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonContextProvider/ComparisonContextProvider';
import AppliedFilters from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/AppliedFilters/AppliedFilters';
import ComparisonCarousel from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonCarousel/ComparisonCarousel';
import ComparisonHeader from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/ComparisonHeader';
import useFullWidth from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/hooks/useFullWidth';
import ComparisonMetaData from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonMetaData/ComparisonMetaData';
import NewComparisonsAlert from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/NewComparisonsAlert/NewComparisonsAlert';
import References from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/References/References';
import SelectEntities from '@/app/grid-editor/components/SelectEntities/SelectEntities';
import NotFound from '@/app/not-found';
import ComparisonLoading from '@/components/Comparison/ComparisonLoading/ComparisonLoading';
import ComparisonTable from '@/components/Comparison/ComparisonTable/ComparisonTable';
import useComparison from '@/components/Comparison/hooks/useComparison';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import AddPaperModal from '@/components/PaperForm/AddPaperModal';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';

const ComparisonPage = () => {
    const [isOpenSelectEntities, setIsOpenSelectEntities] = useState(false);
    const [isOpenCreatePaper, setIsOpenCreatePaper] = useState(false);

    const { id: comparisonId } = useComparisonState();
    const { comparison, updateComparison, error, mutateComparisonContents, isLoadingComparisonContents, isEditMode, comparisonContents } =
        useComparison();

    const sourceAmount = comparison?.sources.length ?? 0;
    const { isFullWidth } = useFullWidth({ sourceAmount });
    const containerStyle = isFullWidth ? { maxWidth: 'calc(100% - clamp(20px, 3vw, 100px))' } : {};

    const handleAddSources = async (sourceIds: string[]) => {
        if (!comparison) {
            return;
        }
        await updateComparison({
            sources: sourceIds.map((id) => ({ id, type: 'THING' as const })),
        });
        mutateComparisonContents(undefined, { revalidate: true });
    };

    const handleCreatePaper = ({ contributionId }: { contributionId: string }) => {
        if (!comparison) {
            return;
        }
        handleAddSources([...comparison.sources.map((source) => source.id), contributionId]);
        setIsOpenCreatePaper(false);
    };

    if (error) {
        return <NotFound />;
    }

    if (!comparison) {
        return null;
    }

    return (
        <div>
            {comparison && (
                <>
                    <ComparisonHeader />

                    <Container className="box rounded p-0 clearfix position-relative overflow-hidden" style={{ marginBottom: isEditMode ? 10 : 0 }}>
                        <EditModeHeader isVisible={isEditMode} message="Edit mode" />
                    </Container>

                    <Container id="description" className="box rounded clearfix position-relative mb-4 px-5">
                        <ComparisonMetaData comparisonId={comparison.id} />

                        <AppliedFilters />
                    </Container>
                </>
            )}

            {!isLoadingComparisonContents && sourceAmount > 1 && <ComparisonCarousel />}

            <NewComparisonsAlert />

            <Container className="box tw:rounded tw:!p-0 tw:relative tw:transition-[max-width] tw:duration-500" style={containerStyle}>
                <>
                    {!isLoadingComparisonContents && sourceAmount > 0 && <ComparisonTable id={comparisonId} />}

                    {!isLoadingComparisonContents && comparison && sourceAmount <= 1 && (
                        <Alert color="info" className="tw:!border-0" fade={false}>
                            {comparison.sources.length === 0
                                ? "This comparison doesn't have any sources yet"
                                : 'A comparison needs to have at least 2 sources'}
                            {isEditMode ? (
                                <>
                                    , click on the <strong>plus button on the right</strong> to add sources
                                </>
                            ) : (
                                ''
                            )}
                        </Alert>
                    )}
                    {isEditMode && (
                        <Button
                            color="primary"
                            className="shadow"
                            style={{ position: 'absolute', right: -45, paddingLeft: 10, paddingRight: 10, top: 0, zIndex: 10 }}
                            aria-label="add source"
                            title="Add source"
                            onClick={() => setIsOpenSelectEntities(true)}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                    )}
                    {isLoadingComparisonContents && <ComparisonLoading />}
                </>
            </Container>
            <Container className="box rounded px-5 clearfix position-relative mt-4">
                <References />
            </Container>

            {isOpenSelectEntities && (
                <SelectEntities
                    allowCreate
                    showDialog
                    toggle={() => setIsOpenSelectEntities((v) => !v)}
                    onCreatePaper={() => setIsOpenCreatePaper(true)}
                    entities={comparisonContents?.titles.map((title, i) => comparisonContents.subtitles[i] ?? title)}
                    setEntityIds={handleAddSources}
                />
            )}
            {isOpenCreatePaper && <AddPaperModal isOpen onCreatePaper={handleCreatePaper} toggle={() => setIsOpenCreatePaper((v) => !v)} />}
        </div>
    );
};

export default ComparisonPage;
