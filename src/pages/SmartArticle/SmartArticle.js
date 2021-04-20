import { faCheckCircle, faDownload, faEllipsisV, faHistory, faPen, faSpinner, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/smartArticle';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { SubtitleSeparator } from 'components/Comparison/styled';
import AcknowledgementsSection from 'components/SmartArticle/AcknowledgementsSection';
import AddSection from 'components/SmartArticle/AddSection';
import AuthorsSection from 'components/SmartArticle/AuthorsSection';
import HistoryModal from 'components/SmartArticle/HistoryModal';
import useLoad from 'components/SmartArticle/hooks/useLoad';
import LoadingArticle from 'components/SmartArticle/LoadingArticle';
import PublishModal from 'components/SmartArticle/PublishModal';
import Sections from 'components/SmartArticle/Sections';
import Title from 'components/SmartArticle/Title';
import ViewArticle from 'components/SmartArticle/ViewArticle';
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

const SmartArticle = () => {
    const { id } = useParams();
    const { load, isLoading, isNotFound } = useLoad();
    const isLoadingInline = useSelector(state => state.smartArticle.isLoading);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const isPublished = useSelector(state => state.smartArticle.isPublished);
    const paper = useSelector(state => state.smartArticle.paper);
    const isOpenHistoryModal = useSelector(state => state.smartArticle.isOpenHistoryModal);
    const researchField = useSelector(state => state.smartArticle.researchField);
    const dispatch = useDispatch();
    const history = useHistory();
    const versions = useSelector(state => state.smartArticle.versions);
    const version = versions.find(version => version.id === id);
    const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY') : null;

    useEffect(() => {
        document.title = 'Smart review - ORKG';

        load(id);
    }, [id, load]);

    const handleEdit = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published article',
                message: `The article you are viewing is published, which means it cannot be modified. To make changes, fetch the live article data and try this action again`,
                cancelColor: 'light',
                confirmText: 'Fetch live data'
            });

            if (isConfirmed) {
                history.push(reverse(ROUTES.SMART_ARTICLE, { id: paper.id }));
            }
        } else {
            setIsEditing(true);
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
                <div className="d-flex">
                    <div className="d-flex align-items-center flex-grow-1">
                        <h1 className="h4 mt-4 mb-4">Smart review</h1>
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
                                    >
                                        <Icon icon={faDownload} />
                                    </Button>
                                </>
                            )}

                            <Button className="flex-shrink-0" color="secondary" size="sm" style={{ marginLeft: 1 }} onClick={toggleHistoryModal}>
                                <Icon icon={faHistory} /> History
                            </Button>
                            {!isEditing ? (
                                <Button className="flex-shrink-0" color="secondary" size="sm" style={{ marginLeft: 1 }} onClick={handleEdit}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            ) : (
                                <>
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
                                        onClick={() => setIsEditing(false)}
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
                </main>
            )}
            {!isLoading && !isEditing && <ViewArticle />}
            {isLoading && <LoadingArticle />}

            {isOpenPublishModal && <PublishModal toggle={() => setIsOpenPublishModal(v => !v)} id={id} show />}
            {isOpenHistoryModal && <HistoryModal toggle={toggleHistoryModal} id={id} show />}
        </div>
    );
};

export default SmartArticle;
