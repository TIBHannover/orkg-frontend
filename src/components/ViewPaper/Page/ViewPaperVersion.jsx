'use client';

import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';
import { Alert, Container } from 'reactstrap';

import NotFound from '@/app/not-found';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import Coins from '@/components/Coins/Coins';
import ExportCitation from '@/components/Comparison/Export/ExportCitation';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ShareLinkMarker from '@/components/ShareLinkMarker/ShareLinkMarker';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import useParams from '@/components/useParams/useParams';
import Contributions from '@/components/ViewPaperVersion/ContributionsVersion/Contributions';
import useViewPaperVersion from '@/components/ViewPaperVersion/hooks/useViewPaperVersion';
import PaperVersionHeader from '@/components/ViewPaperVersion/PaperVersionHeader';
import ROUTES from '@/constants/routes';

const ViewPaperVersion = () => {
    const { resourceId } = useParams();
    const paper = useSelector((state) => state.viewPaper.paper);
    const originalPaperId = useSelector((state) => state.viewPaper.originalPaperId);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dataCiteDoi = useSelector((state) => state.viewPaper.dataCiteDoi);
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.dismiss();
            toast.success('Paper link copied!');
        }
    }, [state.value]);

    const { isLoading, isLoadingFailed, contributions, paperStatements } = useViewPaperVersion({
        paperId: resourceId,
    });

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoadingFailed && (
                <>
                    <Coins item={paper} />
                    <Breadcrumbs researchFieldId={paper.research_fields.length > 0 ? paper.research_fields?.[0]?.id : null} />
                    <TitleBar
                        buttonGroup={
                            <>
                                <Button size="sm" onClick={() => setShowExportCitationsDialog((v) => !v)}>
                                    Export citations
                                </Button>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => setShowPublishDialog((v) => !v)}>Publish</DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem tag={Link} href={`${reverse(ROUTES.RESOURCE, { id: resourceId })}?noRedirect`}>
                                            View resource
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </>
                        }
                    >
                        Paper
                    </TitleBar>
                    <Container className="box pt-md-4 pb-md-4 ps-md-5 pe-md-5 pt-sm-2 pb-sm-2 ps-sm-2 pe-sm-2 clearfix position-relative rounded">
                        {!isLoading && <ShareLinkMarker typeOfLink="paper" title={paper.title} />}

                        {isLoading && (
                            <ContentLoader height="100%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }} speed={2}>
                                <rect x="0" y="0" width="80" height="4" />
                                <rect x="0" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="12" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="24" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="36" y="6" rx="1" ry="1" width="10" height="2" />
                            </ContentLoader>
                        )}
                        {!isLoading && originalPaperId && (
                            <Alert color="warning" className="container d-flex">
                                <div className="flex-grow-1">
                                    You are viewing the published version of the paper. Click to{' '}
                                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}>Fetch live data</Link>
                                </div>
                            </Alert>
                        )}
                        {!isLoading && !isLoadingFailed && <PaperVersionHeader />}
                        {!isLoading && (
                            <>
                                <hr className="mt-3" />
                                <Contributions contributions={contributions} paperStatements={paperStatements} />
                            </>
                        )}
                    </Container>
                </>
            )}
            {dataCiteDoi && showExportCitationsDialog && <ExportCitation toggle={() => setShowExportCitationsDialog((v) => !v)} DOI={dataCiteDoi} />}
            <Modal size="lg" isOpen={showPublishDialog} toggle={() => setShowPublishDialog((v) => !v)}>
                <ModalHeader toggle={() => setShowPublishDialog((v) => !v)}>Publish ORKG paper</ModalHeader>
                <ModalBody>
                    {dataCiteDoi && originalPaperId && (
                        <Alert color="info">
                            <>
                                This paper is already published, you can find the persistent link below.{' '}
                                <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}>Fetch live data</Link> for updating the
                                current version.
                            </>
                        </Alert>
                    )}
                    {dataCiteDoi && (
                        <>
                            <FormGroup>
                                <Label for="paper_link">Paper link</Label>
                                <InputGroup>
                                    <Input id="paper_link" value={`${window.location.href}`} disabled />
                                    <Button
                                        color="primary"
                                        className="pl-3 pr-3"
                                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                        onClick={() => copyToClipboard(`${window.location.href}`)}
                                    >
                                        <FontAwesomeIcon icon={faClipboard} />
                                    </Button>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="doi_link">DOI</Label>
                                <InputGroup>
                                    <Input id="doi_link" value={`https://doi.org/${dataCiteDoi}`} disabled />
                                    <Button
                                        color="primary"
                                        className="pl-3 pr-3"
                                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                        onClick={() => copyToClipboard(`https://doi.org/${dataCiteDoi}`)}
                                    >
                                        <FontAwesomeIcon icon={faClipboard} />
                                    </Button>
                                </InputGroup>
                            </FormGroup>
                        </>
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
};

export default ViewPaperVersion;
