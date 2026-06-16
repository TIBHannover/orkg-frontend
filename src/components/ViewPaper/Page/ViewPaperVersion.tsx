'use client';

import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Dropdown, InputGroup, Label, Modal, Separator, Skeleton, TextField, toast } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import ExportCitation from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/ComparisonHeader/Export/ExportCitation';
import NotFound from '@/app/not-found';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Coins from '@/components/Coins/Coins';
import ShareLinkMarker from '@/components/ShareLinkMarker/ShareLinkMarker';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import PaperHeader from '@/components/ViewPaper/PaperHeader';
import Contributions from '@/components/ViewPaperVersion/ContributionsVersion/Contributions';
import useViewPaperVersion from '@/components/ViewPaperVersion/hooks/useViewPaperVersion';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const ViewPaperVersion = () => {
    const { resourceId } = useParams();

    const { paper, dataCiteDoi, originalPaperId, isLoadingPaperVersion } = useViewPaper({ paperId: resourceId });
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('Paper link copied!');
        }
    }, [state.value]);

    useEffect(() => {
        if (paper && !isLoadingPaperVersion) {
            document.title = paper?.title;
        }
    }, [paper, isLoadingPaperVersion]);

    const { isLoading, isLoadingFailed, contributions, paperStatements } = useViewPaperVersion({
        paperId: resourceId,
    });

    return (
        <div>
            {!isLoading && !isLoadingPaperVersion && isLoadingFailed && <NotFound />}
            {!isLoading && !isLoadingPaperVersion && !isLoadingFailed && paper && (
                <>
                    <Coins item={paper} />
                    <Breadcrumbs researchFieldId={paper?.research_fields?.length > 0 ? paper.research_fields?.[0]?.id : null} />
                    <TitleBar
                        buttonGroup={
                            <>
                                <Button size="sm" className="button--orkg-secondary shrink-0" onPress={() => setShowExportCitationsDialog((v) => !v)}>
                                    Export citations
                                </Button>
                                <ShareLinkMarker
                                    typeOfLink="paper"
                                    title={paper.title}
                                    buttonProps={{ className: 'button--orkg-secondary shrink-0' }}
                                />
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary shrink-0" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item textValue="Publish" onAction={() => setShowPublishDialog((v) => !v)}>
                                                Publish
                                            </Dropdown.Item>
                                            <Separator className="my-1" />
                                            <Dropdown.Item
                                                href={`${reverse(ROUTES.RESOURCE, { id: resourceId })}?noRedirect`}
                                                textValue="View resource"
                                            >
                                                View resource
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </>
                        }
                    >
                        Paper
                    </TitleBar>
                    <Container>
                        <div className="box flow-root relative rounded p-4 md:p-12">
                            {isLoading && (
                                <div className="flex flex-col gap-3">
                                    <Skeleton className="w-4/5 h-4 rounded" />
                                    <div className="flex gap-2">
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                    </div>
                                </div>
                            )}
                            {!isLoading && !isLoadingFailed && <PaperHeader isPublishedVersionView editMode={false} />}
                            {!isLoading && (
                                <>
                                    <Separator className="my-6" />
                                    <Contributions
                                        contributions={contributions}
                                        paperStatements={paperStatements}
                                        snapshotCreatedAt={paper?.created_at}
                                    />
                                </>
                            )}
                        </div>
                    </Container>
                </>
            )}
            {dataCiteDoi && showExportCitationsDialog && <ExportCitation toggle={() => setShowExportCitationsDialog((v) => !v)} DOI={dataCiteDoi} />}
            <Modal.Backdrop isOpen={showPublishDialog} onOpenChange={setShowPublishDialog}>
                <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                    <Modal.Dialog className="sm:max-w-lg">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>Publish ORKG paper</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="p-6">
                            {dataCiteDoi && originalPaperId && (
                                <Alert status="accent" className="mb-4">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>Paper already published</Alert.Title>
                                        <Alert.Description>
                                            You can find the persistent link below.{' '}
                                            <Link
                                                className={`${buttonVariants({ size: 'sm' })} hover:no-underline`}
                                                href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}
                                            >
                                                Fetch live data
                                            </Link>{' '}
                                            to update the current version.
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                            )}
                            {dataCiteDoi && (
                                <>
                                    <TextField isDisabled className="mb-4" name="paper_link">
                                        <Label className="mb-1 inline-block">Paper link</Label>
                                        <InputGroup fullWidth>
                                            <InputGroup.Input value={`${window.location.href}`} />
                                            <InputGroup.Suffix className="pr-0">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy paper link"
                                                    onPress={() => copyToClipboard(`${window.location.href}`)}
                                                >
                                                    <FontAwesomeIcon icon={faClipboard} />
                                                </Button>
                                            </InputGroup.Suffix>
                                        </InputGroup>
                                    </TextField>
                                    <TextField isDisabled className="mb-4" name="doi_link">
                                        <Label className="mb-1 inline-block">DOI</Label>
                                        <InputGroup fullWidth>
                                            <InputGroup.Input value={`https://doi.org/${dataCiteDoi}`} />
                                            <InputGroup.Suffix className="pr-0">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="ghost"
                                                    aria-label="Copy DOI link"
                                                    onPress={() => copyToClipboard(`https://doi.org/${dataCiteDoi}`)}
                                                >
                                                    <FontAwesomeIcon icon={faClipboard} />
                                                </Button>
                                            </InputGroup.Suffix>
                                        </InputGroup>
                                    </TextField>
                                </>
                            )}
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </div>
    );
};

export default ViewPaperVersion;
