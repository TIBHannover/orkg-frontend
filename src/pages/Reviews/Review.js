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
import { toggleHistoryModal as toggleHistoryModalAction, setIsEditing } from 'actions/review';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import AcknowledgementsSection from 'components/Review/AcknowledgementsSection';
import AddSection from 'components/Review/AddSection';
import AuthorsSection from 'components/Review/AuthorsSection';
import HistoryModal from 'components/Review/HistoryModal';
import useLoad from 'components/Review/hooks/useLoad';
import LoadingArticle from 'components/ArticleBuilder/LoadingArticle';
import PublishModal from 'components/Review/PublishModal';
import Sections from 'components/Review/Sections';
import Title from 'components/Review/Title';
import ViewArticle from 'components/Review/ViewArticle';
import { SubTitle } from 'components/styled';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'components/Confirmation/Confirmation';
import { createGlobalStyle } from 'styled-components';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ReferencesModal from 'components/Review/References/ReferencesModal';
import ReferencesSection from 'components/Review/References/ReferencesSection';
import ShouldPublishModal from 'components/Review/ShouldPublishModal';
import { usePrevious } from 'react-use';
import LoadingOverlay from 'components/ArticleBuilder/LoadingOverlay';
import TitleBar from 'components/TitleBar/TitleBar';
import { Helmet } from 'react-helmet';

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
        .container.print-only .comparison-table {
            display: none;
        }
        body {
            background-color: #fff !important;
        }
        .show-on-print {
            display: block!important;
        }
    }
    .show-on-print {
        display: none
    }
`;

const Review = () => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenShouldPublishModal, setIsOpenShouldPublishModal] = useState(false);
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const isLoadingInline = useSelector(state => state.review.isLoading);
    const isLoadingSortSection = useSelector(state => state.review.isLoadingSortSection);
    const isEditing = useSelector(state => state.review.isEditing);
    const isPublished = useSelector(state => state.review.isPublished);
    const paper = useSelector(state => state.review.paper);
    const isOpenHistoryModal = useSelector(state => state.review.isOpenHistoryModal);
    const researchField = useSelector(state => state.review.researchField);
    const versions = useSelector(state => state.review.versions);
    const authors = useSelector(state => state.review.authorResources);
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
        let title = 'Review - ORKG';
        if (paper.title) {
            title = `${paper.title} - Review - ORKG`;
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
                title: 'This is a published review',
                message: `The review you are viewing is published, which means it cannot be modified. To make changes, fetch the live review data and try this action again`,
                proceedLabel: 'Fetch live data'
            });

            if (isConfirmed) {
                history.push(reverse(ROUTES.REVIEW, { id: paper.id }));
            }
        } else {
            dispatch(setIsEditing(true));
        }
    };

    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());

    if (isNotFound) {
        return <NotFound />;
    }

    const ldJson = {
        mainEntity: {
            headline: `${paper?.title ?? ''} - Review - ORKG`,
            description: version?.description,
            author: authors?.map(author => ({
                name: author?.label,
                ...(author?.orcid ? { url: `http://orcid.org/${author.orcid}` } : {}),
                '@type': 'Person'
            })),
            datePublished: publicationDate,
            about: researchField?.label,
            '@type': 'ScholarlyArticle'
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage'
    };

    return (
        <div>
            {researchField && <Breadcrumbs researchFieldId={researchField.id} />}
            <GlobalStyle />
            <Helmet>
                <title>{`${paper?.title ?? 'Unpublished'} - Review - ORKG`}</title>
                <meta property="og:title" content={`${paper?.title ?? 'Unpublished'} - Review - ORKG`} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={version?.description} />
                <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
            </Helmet>
            <TitleBar
                titleAddition={
                    publicationDate && (
                        <>
                            <Tippy content={`Update message: "${version.description}"`}>
                                <SubTitle className=" mt-1">
                                    Published on <time dateTime={version?.date}>{publicationDate}</time> - Version {versionNumber}
                                </SubTitle>
                            </Tippy>
                        </>
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
                            <>
                                <Button
                                    className="flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    style={{ marginRight: 2 }}
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
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id })}>
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

export default Review;
