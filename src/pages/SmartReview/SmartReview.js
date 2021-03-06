import {
    faCheckCircle,
    faDownload,
    faEllipsisV,
    faHistory,
    faPen,
    faQuoteRight,
    faSpinner,
    faTimes,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction, setIsEditing } from 'actions/smartReview';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { SubtitleSeparator } from 'components/Comparison/styled';
import AcknowledgementsSection from 'components/SmartReview/AcknowledgementsSection';
import AddSection from 'components/SmartReview/AddSection';
import AuthorsSection from 'components/SmartReview/AuthorsSection';
import HistoryModal from 'components/SmartReview/HistoryModal';
import useLoad from 'components/SmartReview/hooks/useLoad';
import LoadingArticle from 'components/SmartReview/LoadingArticle';
import PublishModal from 'components/SmartReview/PublishModal';
import Sections from 'components/SmartReview/Sections';
import Title from 'components/SmartReview/Title';
import ViewArticle from 'components/SmartReview/ViewArticle';
import { SubTitle } from 'components/styled';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, ButtonGroup, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'reactstrap-confirm';
import { createGlobalStyle } from 'styled-components';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ReferencesModal from 'components/SmartReview/References/ReferencesModal';
import ReferencesSection from 'components/SmartReview/References/ReferencesSection';
import ShouldPublishModal from 'components/SmartReview/ShouldPublishModal';
import { usePrevious } from 'react-use';
import LoadingOverlay from 'components/SmartReview/LoadingOverlay';

const GlobalStyle = createGlobalStyle`
    // ensure printing only prints the contents and no other elements
    @media print {
        nav,
        footer,
        .woot--bubble-holder,
        .container:not(.print-only) {
            display: none !important;
        }
        .container.print-only {
            margin: 0;
            padding: 0;
            max-width: 100%;
            margin-top: -100px;
        }
        body {
            background-color: #fff !important;
        }
    }
`;

const SmartReview = () => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenShouldPublishModal, setIsOpenShouldPublishModal] = useState(false);
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const isLoadingInline = useSelector(state => state.smartReview.isLoading);
    const isEditing = useSelector(state => state.smartReview.isEditing);
    const isPublished = useSelector(state => state.smartReview.isPublished);
    const paper = useSelector(state => state.smartReview.paper);
    const isOpenHistoryModal = useSelector(state => state.smartReview.isOpenHistoryModal);
    const researchField = useSelector(state => state.smartReview.researchField);
    const versions = useSelector(state => state.smartReview.versions);
    const prevIsEditing = usePrevious(isEditing);
    const dispatch = useDispatch();
    const history = useHistory();
    const { load, isLoading, isNotFound, getVersions } = useLoad();
    const { id } = useParams();
    const version = versions.find(version => version.id === id);
    const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY') : null;

    useEffect(() => {
        load(id);
    }, [id, load]);

    useEffect(() => {
        let title = 'SmartReview - ORKG';
        if (paper.title) {
            title = `${paper.title} - SmartReview - ORKG`;
        }
        document.title = title;
    }, [paper]);

    useEffect(() => {
        if (prevIsEditing && !isEditing) {
            setIsOpenShouldPublishModal(true);
        }
    }, [isEditing, prevIsEditing]);

    const handleEdit = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published article',
                message: `The article you are viewing is published, which means it cannot be modified. To make changes, fetch the live article data and try this action again`,
                cancelColor: 'light',
                confirmText: 'Fetch live data'
            });

            if (isConfirmed) {
                history.push(reverse(ROUTES.SMART_REVIEW, { id: paper.id }));
            }
        } else {
            dispatch(setIsEditing(true));
        }
    };

    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {researchField && <Breadcrumbs researchFieldId={researchField.id} />}
            <GlobalStyle />
            <Container
                prefix="doco: http://purl.org/spar/doco/ fabio: http://purl.org/spar/fabio/ deo: http://purl.org/spar/deo/ c4o: http://purl.org/spar/c4o foaf: http://xmlns.com/foaf/0.1/"
                typeof="fabio:ScholarlyWork"
            >
                <div className="d-flex flex-wrap mt-4 mb-4">
                    <div className="d-flex align-items-center flex-grow-1 flex-wrap">
                        <h1 className="h4 m-0">SmartReview</h1>
                        {publicationDate && (
                            <>
                                <SubtitleSeparator />
                                <Tippy content={`Update message: "${version.description}"`}>
                                    <SubTitle>
                                        Published on <time dateTime={version?.date}>{publicationDate}</time> - Version {versionNumber}
                                    </SubTitle>
                                </Tippy>
                            </>
                        )}
                    </div>
                    <div className="flex-shrink-0 d-flex align-items-center">
                        {isEditing && (
                            <>
                                {isLoadingInline ? (
                                    <Icon icon={faSpinner} spin className="mr-2" />
                                ) : (
                                    <Tippy content="All changes are saved">
                                        <span className="mr-2">
                                            <Icon
                                                icon={faCheckCircle}
                                                className="text-secondary"
                                                style={{ fontSize: '125%', verticalAlign: 'middle' }}
                                                aria-label="All changes are saved"
                                            />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        )}
                        <ButtonGroup>
                            {!isEditing && (
                                <>
                                    <Button
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => window.print()}
                                        aria-label="Print article"
                                    >
                                        <Icon icon={faDownload} />
                                    </Button>
                                </>
                            )}

                            {!isEditing ? (
                                <>
                                    <Button
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={toggleHistoryModal}
                                        aria-label="View article history"
                                    >
                                        <Icon icon={faHistory} /> History
                                    </Button>

                                    <RequireAuthentication
                                        component={Button}
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={handleEdit}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                </>
                            ) : (
                                <>
                                    <Button
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => setIsOpenReferencesModal(true)}
                                        aria-label="Manage article references"
                                    >
                                        <Icon icon={faQuoteRight} /> References
                                    </Button>
                                    <Button
                                        className="flex-shrink-0"
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => setIsOpenPublishModal(true)}
                                    >
                                        <Icon icon={faUpload} /> Publish
                                    </Button>
                                    <Button
                                        className="flex-shrink-0"
                                        active
                                        color="secondary"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => dispatch(setIsEditing(false))}
                                    >
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                </>
                            )}
                            <UncontrolledButtonDropdown>
                                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                    <Icon icon={faEllipsisV} />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id })}>
                                        View resource
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </ButtonGroup>
                    </div>
                </div>
            </Container>
            <LoadingOverlay />

            {!isLoading && isEditing && (
                <main>
                    <header>
                        <Container>
                            <Title />
                            <AuthorsSection />
                        </Container>
                    </header>
                    <AddSection index={0} />
                    <Sections />
                    <Container>
                        <AcknowledgementsSection />
                    </Container>
                    <Container>
                        <ReferencesSection />
                    </Container>
                </main>
            )}
            {!isLoading && !isEditing && <ViewArticle />}
            {isLoading && <LoadingArticle />}

            {isOpenPublishModal && (
                <PublishModal toggle={() => setIsOpenPublishModal(v => !v)} id={id} getVersions={getVersions} paperId={paper.id} show />
            )}
            {isOpenHistoryModal && <HistoryModal toggle={toggleHistoryModal} id={id} show />}
            {isOpenReferencesModal && <ReferencesModal toggle={() => setIsOpenReferencesModal(v => !v)} id={id} show />}
            {isOpenShouldPublishModal && (
                <ShouldPublishModal toggle={() => setIsOpenShouldPublishModal(v => !v)} show openPublishModal={() => setIsOpenPublishModal(true)} />
            )}
        </div>
    );
};

export default SmartReview;
