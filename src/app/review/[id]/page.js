'use client';

import {
    faCheckCircle,
    faDownload,
    faEllipsisV,
    faHistory,
    faPen,
    faQuoteRight,
    faSpinner,
    faTimes,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import LoadingArticle from 'components/ArticleBuilder/LoadingArticle';
import LoadingOverlay from 'components/ArticleBuilder/LoadingOverlay';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import Confirm from 'components/Confirmation/Confirmation';
import ExportCitation from 'components/ExportCitation/ExportCitation';
import GraphViewModal from 'components/GraphView/GraphViewModal';
import Link from 'components/NextJsMigration/Link';
import useParams from 'components/NextJsMigration/useParams';
import useRouter from 'components/NextJsMigration/useRouter';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import AcknowledgementsSection from 'components/Review/AcknowledgementsSection';
import AddSection from 'components/Review/AddSection';
import AuthorsSection from 'components/Review/AuthorsSection';
import HistoryModal from 'components/Review/HistoryModal';
import PublishModal from 'components/Review/PublishModal';
import ReferencesModal from 'components/Review/References/ReferencesModal';
import ReferencesSection from 'components/Review/References/ReferencesSection';
import Sections from 'components/Review/Sections';
import ShouldPublishModal from 'components/Review/ShouldPublishModal';
import Title from 'components/Review/Title';
import ViewArticle from 'components/Review/ViewArticle';
import useLoad from 'components/Review/hooks/useLoad';
import TitleBar from 'components/TitleBar/TitleBar';
import { SubTitle } from 'components/styled';
import { CLASSES } from 'constants/graphSettings';
import { LICENSE_URL } from 'constants/misc';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { usePrevious } from 'react-use';
import { Button, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { setIsEditing, toggleHistoryModal as toggleHistoryModalAction } from 'slices/reviewSlice';
import { createGlobalStyle } from 'styled-components';

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

            .box {
                box-shadow: none;
            }
        }
        body {
            background-color: #fff !important;
        }
    }
`;

const Review = () => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenShouldPublishModal, setIsOpenShouldPublishModal] = useState(false);
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [showExportCitation, setShowExportCitation] = useState(false);

    const isLoadingInline = useSelector((state) => state.review.isLoading);
    const isLoadingSortSection = useSelector((state) => state.review.isLoadingSortSection);
    const isEditing = useSelector((state) => state.review.isEditing);
    const isPublished = useSelector((state) => state.review.isPublished);
    const paper = useSelector((state) => state.review.paper);
    const isOpenHistoryModal = useSelector((state) => state.review.isOpenHistoryModal);
    const researchField = useSelector((state) => state.review.researchField);
    const versions = useSelector((state) => state.review.versions);
    const authors = useSelector((state) => state.review.authorResources);
    const prevIsEditing = usePrevious(isEditing);
    const prevIsOpenPublishModal = usePrevious(isOpenPublishModal);
    const dispatch = useDispatch();
    const router = useRouter();
    const { load, isLoading, isNotFound, hasFailed, getVersions } = useLoad();
    const { id } = useParams();
    const version = versions.find((_version) => _version.id === id);
    const versionNumber = versions.length ? versions.length - versions.findIndex((_version) => _version.id === id) : null;
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY') : null;

    useEffect(() => {
        load(id);
    }, [id, load]);

    useEffect(() => {
        let title = 'Review - ORKG';
        if (paper.title) {
            title = `${paper.title} - Review - ORKG`;
        }
        document.title = title;
    }, [paper]);

    useEffect(() => {
        if (prevIsEditing && !isEditing && !prevIsOpenPublishModal) {
            setIsOpenShouldPublishModal(true);
        }
    }, [isEditing, prevIsEditing, prevIsOpenPublishModal]);

    const handleEdit = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published review',
                message:
                    'The review you are viewing is published, which means it cannot be modified. To make changes, fetch the live review data and try this action again',
                proceedLabel: 'Fetch live data',
            });

            if (isConfirmed) {
                router.push(reverse(ROUTES.REVIEW, { id: paper.id }));
            }
        } else {
            dispatch(setIsEditing(true));
        }
    };

    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    if (isNotFound) {
        return <NotFound />;
    }

    if (hasFailed) {
        return <InternalServerError />;
    }

    const ldJson = {
        mainEntity: {
            headline: `${paper?.title ?? ''} - Review - ORKG`,
            description: version?.description,
            author: authors?.map((author) => ({
                name: author?.label,
                ...(author?.orcid ? { url: `http://orcid.org/${author.orcid}` } : {}),
                '@type': 'Person',
            })),
            datePublished: publicationDate,
            about: researchField?.label,
            license: LICENSE_URL,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    return (
        <div>
            {researchField && <Breadcrumbs researchFieldId={researchField.id} />}
            <GlobalStyle />
            <Helmet>
                <title>{`${paper?.title ?? ''} - Review - ORKG`}</title>
                <meta property="og:title" content={`${paper?.title ?? ''} - Review - ORKG`} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={version?.description} />
                <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
            </Helmet>
            <TitleBar
                titleAddition={
                    publicationDate && (
                        <Tippy content={`Update message: "${version.description}"`}>
                            <SubTitle className=" mt-1">
                                Published on <time dateTime={version?.date}>{publicationDate}</time> - Version {versionNumber}
                            </SubTitle>
                        </Tippy>
                    )
                }
                buttonGroup={
                    <>
                        {isEditing && (
                            <div color="light-darker" className="btn btn-light-darker btn-sm px-2" style={{ cursor: 'default' }}>
                                {isLoadingInline ? (
                                    <Icon icon={faSpinner} spin className="me-2 text-secondary" />
                                ) : (
                                    <Tippy content="All changes are saved">
                                        <span>
                                            <Icon
                                                icon={faCheckCircle}
                                                className="text-secondary"
                                                style={{ fontSize: '140%', verticalAlign: 'middle' }}
                                                aria-label="All changes are saved"
                                            />
                                        </span>
                                    </Tippy>
                                )}
                            </div>
                        )}
                        {!isEditing && (
                            <Button
                                className="flex-shrink-0"
                                color="secondary"
                                size="sm"
                                style={{ marginRight: 2 }}
                                onClick={() => window?.print()}
                                aria-label="Print article"
                            >
                                <Icon icon={faDownload} />
                            </Button>
                        )}

                        {!isEditing ? (
                            <>
                                <Button
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
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
                                    style={{ marginRight: 2 }}
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
                                    style={{ marginRight: 2 }}
                                    onClick={() => setIsOpenReferencesModal(true)}
                                    aria-label="Manage article references"
                                >
                                    <Icon icon={faQuoteRight} /> References
                                </Button>
                                <Button
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={() => setIsOpenPublishModal(true)}
                                >
                                    <Icon icon={faUpload} /> Publish
                                </Button>
                                <Button
                                    className="flex-shrink-0"
                                    active
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
                                    onClick={() => dispatch(setIsEditing(false))}
                                >
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            </>
                        )}
                        <UncontrolledButtonDropdown>
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu end>
                                <DropdownItem onClick={() => setShowExportCitation((v) => !v)}>Export citation</DropdownItem>
                                <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                <DropdownItem tag={Link} end href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </>
                }
            >
                Review
            </TitleBar>
            <LoadingOverlay isLoading={isLoadingSortSection} />
            {!isLoading && isEditing && (
                <main
                    prefix="doco: http://purl.org/spar/doco/ fabio: http://purl.org/spar/fabio/ deo: http://purl.org/spar/deo/ c4o: http://purl.org/spar/c4o foaf: http://xmlns.com/foaf/0.1/"
                    typeof="fabio:ScholarlyWork"
                >
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
                <PublishModal toggle={() => setIsOpenPublishModal((v) => !v)} id={id} getVersions={getVersions} paperId={paper.id} show />
            )}
            {isOpenHistoryModal && <HistoryModal toggle={toggleHistoryModal} id={id} show />}
            {isOpenReferencesModal && <ReferencesModal toggle={() => setIsOpenReferencesModal((v) => !v)} id={id} show />}
            {isOpenShouldPublishModal && (
                <ShouldPublishModal toggle={() => setIsOpenShouldPublishModal((v) => !v)} show openPublishModal={() => setIsOpenPublishModal(true)} />
            )}
            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={id} />}
            {showExportCitation && (
                <ExportCitation
                    id={id}
                    title={paper?.title}
                    authors={authors.map((author) => author?.label)}
                    classId={CLASSES.SMART_REVIEW_PUBLISHED}
                    isOpen={showExportCitation}
                    toggle={() => setShowExportCitation((v) => !v)}
                />
            )}
        </div>
    );
};

export default Review;
