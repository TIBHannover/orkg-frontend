import { Alert, Button, Modal, ProgressBar, Spinner } from '@heroui/react';
import { useEffect, useState } from 'react';

import PaperList from '@/components/ConfirmBulkImport/PaperList';
import useImportBulkData from '@/components/ConfirmBulkImport/useImportBulkData';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type ConfirmBulkImportProps = {
    data: string[][];
    isOpen: boolean;
    toggle: () => void;
    onFinish: (papers: string[], contributions: string[]) => void;
};

const ConfirmBulkImport = ({ data, isOpen, toggle, onFinish: onFinishParent = () => {} }: ConfirmBulkImportProps) => {
    const [isFinished, setIsFinished] = useState(false);

    const onFinish = (papers: string[], contributions: string[]) => {
        setIsFinished(true);
        onFinishParent(papers, contributions);
    };
    const {
        papers,
        existingPaperIds,
        idToLabel,
        idToEntityType,
        isLoading,
        createdContributions,
        makePaperList,
        handleImport,
        validationErrors,
        importFailed,
    } = useImportBulkData({
        data,
        onFinish,
    });

    useEffect(() => {
        makePaperList();
    }, [data, makePaperList]);

    const comparisonUrl = createdContributions
        ? `${reverse(ROUTES.GRID_EDITOR)}?entityIds=${createdContributions.map((entry) => entry.contributionId)}`
        : null;

    const progressPercentage =
        createdContributions.length > 0 && papers.length > 0 ? Math.round((createdContributions.length / papers.length) * 100) : 0;

    const showReview = !isLoading && createdContributions.length === 0 && !isFinished;

    return (
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable={false}
        >
            <Modal.Container size="lg" className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="sm:max-w-4xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Review import</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        {showReview && (
                            <>
                                <Alert status="accent">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Description>
                                            The following contributions will be imported, please review the content carefully
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                                <PaperList
                                    papers={papers}
                                    existingPaperIds={existingPaperIds}
                                    idToLabel={idToLabel}
                                    idToEntityType={idToEntityType}
                                    validationErrors={validationErrors}
                                />
                            </>
                        )}
                        {isLoading && (
                            <div className="flex flex-col items-center gap-4 py-8 text-center">
                                <Spinner size="lg" />
                                {createdContributions.length > 0 && (
                                    <div className="flex w-full flex-col items-center gap-2">
                                        <ProgressBar value={progressPercentage} color="success" className="w-1/2">
                                            <ProgressBar.Track>
                                                <ProgressBar.Fill />
                                            </ProgressBar.Track>
                                        </ProgressBar>
                                        <div>
                                            Importing paper {createdContributions.length}/{papers.length}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {isFinished && (
                            <>
                                {createdContributions.length > 0 && (
                                    <>
                                        <Alert status="success">
                                            <Alert.Indicator />
                                            <Alert.Content>
                                                <Alert.Description>
                                                    Import successful, {createdContributions.length} papers are imported
                                                </Alert.Description>
                                            </Alert.Content>
                                        </Alert>
                                        <p className="m-0">The imported papers can be viewed in the grid editor</p>
                                        <Button
                                            variant="primary"
                                            onPress={() => {
                                                if (comparisonUrl) window.open(comparisonUrl, '_blank', 'noopener');
                                            }}
                                        >
                                            Grid editor
                                        </Button>
                                    </>
                                )}
                                {importFailed.length > 0 && (
                                    <Alert status="danger">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Description>The following papers failed to import:</Alert.Description>
                                            <ul className="m-0 mt-1 list-disc ps-5">
                                                {importFailed.map((paper) => (
                                                    <li key={paper}>{paper}</li>
                                                ))}
                                            </ul>
                                        </Alert.Content>
                                    </Alert>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    {showReview && (
                        <Modal.Footer>
                            <Button variant="primary" onPress={handleImport}>
                                Import
                            </Button>
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ConfirmBulkImport;
