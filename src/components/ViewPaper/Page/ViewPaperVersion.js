import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import NotFound from 'app/not-found';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import Link from 'components/NextJsMigration/Link';
import useParams from 'components/NextJsMigration/useParams';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import TitleBar from 'components/TitleBar/TitleBar';
import Contributions from 'components/ViewPaperVersion/ContributionsVersion/Contributions';
import PaperVersionHeader from 'components/ViewPaperVersion/PaperVersionHeader';
import useViewPaperVersion from 'components/ViewPaperVersion/hooks/useViewPaperVersion';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Alert,
    Button,
    ButtonDropdown,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    FormGroup,
    Input,
    InputGroup,
    Label,
    Modal,
    ModalBody,
    ModalHeader,
} from 'reactstrap';

const ViewPaperVersion = () => {
    const { resourceId } = useParams();
    const paper = useSelector((state) => state.viewPaper.paper);
    const originalPaperId = useSelector((state) => state.viewPaper.originalPaperId);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dataCiteDoi = useSelector((state) => state.viewPaper.dataCiteDoi);

    const { isLoading, isLoadingFailed, contributions, paperStatements } = useViewPaperVersion({
        paperId: resourceId,
    });

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoadingFailed && (
                <>
                    <Breadcrumbs researchFieldId={paper.research_fields.length > 0 ? paper.research_fields?.[0]?.id : null} />
                    <TitleBar
                        buttonGroup={
                            <>
                                <Button size="sm" onClick={() => setShowExportCitationsDialog((v) => !v)}>
                                    Export citations
                                </Button>
                                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
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
                        {!isLoading && (
                            <>
                                {originalPaperId && (
                                    <Alert color="warning" className="container d-flex">
                                        <div className="flex-grow-1">
                                            You are viewing the published version of the paper. Click to{' '}
                                            <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}>Fetch live data</Link>
                                        </div>
                                    </Alert>
                                )}
                            </>
                        )}
                        {!isLoading && !isLoadingFailed && (
                            <>
                                <PaperVersionHeader />
                            </>
                        )}
                        {!isLoading && (
                            <>
                                <hr className="mt-3" />
                                <Contributions contributions={contributions} paperStatements={paperStatements} />
                            </>
                        )}
                    </Container>
                </>
            )}
            {dataCiteDoi && (
                <ExportCitation showDialog={showExportCitationsDialog} toggle={() => setShowExportCitationsDialog((v) => !v)} DOI={dataCiteDoi} />
            )}
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
                                    <CopyToClipboard
                                        text={`${window.location.href}`}
                                        onCopy={() => {
                                            toast.dismiss();
                                            toast.success('Paper link copied!');
                                        }}
                                    >
                                        <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                            <Icon icon={faClipboard} />
                                        </Button>
                                    </CopyToClipboard>
                                </InputGroup>
                            </FormGroup>
                            <FormGroup>
                                <Label for="doi_link">DOI</Label>
                                <InputGroup>
                                    <Input id="doi_link" value={`https://doi.org/${dataCiteDoi}`} disabled />
                                    <CopyToClipboard
                                        text={`https://doi.org/${dataCiteDoi}`}
                                        onCopy={() => {
                                            toast.dismiss();
                                            toast.success('DOI link copied!');
                                        }}
                                    >
                                        <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                            <Icon icon={faClipboard} />
                                        </Button>
                                    </CopyToClipboard>
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
