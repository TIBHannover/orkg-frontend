import { Container, Modal, ModalHeader, ModalBody, Input, Button, Label, FormGroup, Alert, InputGroup } from 'reactstrap';
import NotFound from 'pages/NotFound';
import ContentLoader from 'react-content-loader';
import { useParams } from 'react-router-dom';
import Contributions from 'components/ViewPaperVersion/ContributionsVersion/Contributions';
import useViewPaperVersion from 'components/ViewPaperVersion/hooks/useViewPaperVersion';
import PaperVersionHeader from 'components/ViewPaperVersion/PaperVersionHeader';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import { useSelector } from 'react-redux';
import env from '@beam-australia/react-env';
import TitleBar from 'components/TitleBar/TitleBar';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import ExportCitation from 'components/Comparison/Export/ExportCitation';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';

const ViewPaperVersion = () => {
    const { resourceId } = useParams();
    const viewPaper = useSelector(state => state.viewPaper);
    const [showExportCitationsDialog, setShowExportCitationsDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const dataCiteDoi = useSelector(state => state.viewPaper.dataCiteDoi);

    const { isLoading, isLoadingFailed, contributions } = useViewPaperVersion({
        paperId: resourceId
    });

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoadingFailed && (
                <>
                    <Breadcrumbs researchFieldId={viewPaper.researchField ? viewPaper.researchField.id : null} />
                    <br />
                    <TitleBar
                        buttonGroup={
                            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem onClick={() => setShowExportCitationsDialog(v => !v)}>Export citations</DropdownItem>
                                    <DropdownItem onClick={() => setShowPublishDialog(v => !v)}>Publish</DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        }
                    >
                        View paper
                    </TitleBar>
                    <Container
                        className={`box pt-md-4 pb-md-4 ps-md-5 pe-md-5 pt-sm-2 pb-sm-2 ps-sm-2 pe-sm-2 clearfix position-relative 
                                ${false ? 'rounded-bottom' : 'rounded'}`}
                    >
                        {!isLoading && <ShareLinkMarker typeOfLink="paper" title={viewPaper.paperResource.label} />}

                        {isLoading && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 10"
                                style={{ width: '100% !important' }}
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" width="80" height="4" />
                                <rect x="0" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="12" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="24" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="36" y="6" rx="1" ry="1" width="10" height="2" />
                            </ContentLoader>
                        )}
                        {!isLoading && !isLoadingFailed && (
                            <>
                                <PaperVersionHeader />
                            </>
                        )}
                        {!isLoading && (
                            <>
                                <hr className="mt-3" />
                                <Contributions contributions={contributions} />
                            </>
                        )}
                    </Container>
                </>
            )}
            {dataCiteDoi && (
                <ExportCitation showDialog={showExportCitationsDialog} toggle={() => setShowExportCitationsDialog(v => !v)} DOI={dataCiteDoi.label} />
            )}
            <Modal size="lg" isOpen={showPublishDialog} toggle={() => setShowPublishDialog(v => !v)}>
                <ModalHeader toggle={() => setShowPublishDialog(v => !v)}>Publish ORKG paper</ModalHeader>
                <ModalBody>
                    {dataCiteDoi && viewPaper.originalPaperId && (
                        <Alert color="info">
                            <>
                                {' '}
                                This paper is already published, you can find the persistent link below.
                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: viewPaper.originalPaperId })}> Fetch live data</Link> for updating
                                the current version.{' '}
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
                                            toast.success(`Paper link copied!`);
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
                                    <Input id="doi_link" value={`https://doi.org/${dataCiteDoi.label}`} disabled />
                                    <CopyToClipboard
                                        text={`https://doi.org/${dataCiteDoi.label}`}
                                        onCopy={() => {
                                            toast.dismiss();
                                            toast.success(`DOI link copied!`);
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
