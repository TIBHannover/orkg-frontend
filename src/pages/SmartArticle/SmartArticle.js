import { faCheckCircle, faDownload, faEllipsisV, faHistory, faPen, faSpinner, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { toggleHistoryModal as toggleHistoryModalAction } from 'actions/smartArticle';
import { SubtitleSeparator } from 'components/Comparison/styled';
import AddSection from 'components/SmartArticle/AddSection';
import AuthorsSection from 'components/SmartArticle/AuthorsSection';
import HistoryModal from 'components/SmartArticle/HistoryModal';
import useLoad from 'components/SmartArticle/hooks/useLoad';
import PublishModal from 'components/SmartArticle/PublishModal';
import Sections from 'components/SmartArticle/Sections';
import Title from 'components/SmartArticle/Title';
import ViewArticle from 'components/SmartArticle/ViewArticle';
import { SubTitle } from 'components/styled';
import ROUTES from 'constants/routes';
import { times } from 'lodash';
import moment from 'moment';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
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

const SmartArticle = props => {
    const id = props.match.params.id || null;
    const { load, isLoading, isNotFound } = useLoad();
    const isLoadingInline = useSelector(state => state.smartArticle.isLoading);
    const [isEditing, setIsEditing] = useState(false);
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    //const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    const isPublished = useSelector(state => state.smartArticle.isPublished);
    const paper = useSelector(state => state.smartArticle.paper);
    const isOpenHistoryModal = useSelector(state => state.smartArticle.isOpenHistoryModal);
    const dispatch = useDispatch();
    const history = useHistory();

    const versions = useSelector(state => state.smartArticle.versions);
    const version = versions.find(version => version.id === id);
    const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY') : null;

    useEffect(() => {
        document.title = 'Smart survey - ORKG';

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
            <GlobalStyle />
            <Container>
                <div className="d-flex ">
                    <div className="d-flex align-items-center flex-grow-1">
                        <h1 className="h4 mt-4 mb-4">Smart article</h1>
                        {publicationDate && (
                            <>
                                <SubtitleSeparator />
                                <Tippy content={`Update message: "${version.description}"`}>
                                    <SubTitle>
                                        Published on {publicationDate} - Version {versionNumber}
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
                                            <Icon icon={faCheckCircle} className="text-darkblue" style={{ fontSize: '125%' }} />
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
                                        color="darkblue"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => window.print()}
                                    >
                                        <Icon icon={faDownload} />
                                    </Button>
                                </>
                            )}

                            <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }} onClick={toggleHistoryModal}>
                                <Icon icon={faHistory} /> History
                            </Button>
                            {/*isEditing && (
                                <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }}>
                                    <Icon icon={faCog} />
                                </Button>
                            )*/}

                            {!isEditing ? (
                                <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }} onClick={handleEdit}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        className="flex-shrink-0"
                                        color="darkblue"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => setIsOpenPublishModal(true)}
                                    >
                                        <Icon icon={faUpload} /> Publish
                                    </Button>
                                    <Button
                                        className="flex-shrink-0"
                                        active
                                        color="darkblue"
                                        size="sm"
                                        style={{ marginLeft: 1 }}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                </>
                            )}
                            <UncontrolledButtonDropdown>
                                <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
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
                <>
                    <Container>
                        <Title />
                        <AuthorsSection />
                    </Container>
                    <AddSection index={0} />
                    <Sections />
                </>
            )}
            {!isLoading && !isEditing && <ViewArticle />}
            {isLoading && (
                <Container>
                    <div className="box rounded p-5">
                        <ContentLoader height="500" width="100%" speed={2} foregroundColor="#f3f3f3" backgroundColor="#ccc" viewBox="0 0 100 50">
                            {/* title */}
                            <rect x="0" y="0" rx="0" ry="0" width="100" height="5" />
                            {/* authors */}
                            <rect x="0" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="16" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                            <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                            {/* 2 sections */}
                            {times(2, i => (
                                <React.Fragment key={i}>
                                    <rect x="0" y={13 + i * 17} rx="0" ry="0" width="100" height="4" />
                                    <rect x="0" y={18 + i * 17} rx="0" ry="0" width="30" height="1" />
                                    <rect x="0" y={20 + i * 17} rx="0" ry="0" width="45" height="1" />
                                    <rect x="0" y={22 + i * 17} rx="0" ry="0" width="35" height="1" />
                                    <rect x="0" y={24 + i * 17} rx="0" ry="0" width="45" height="1" />
                                </React.Fragment>
                            ))}
                        </ContentLoader>
                    </div>
                </Container>
            )}
            {isOpenPublishModal && <PublishModal toggle={() => setIsOpenPublishModal(v => !v)} id={id} show />}
            {isOpenHistoryModal && <HistoryModal toggle={toggleHistoryModal} id={id} show />}
        </div>
    );
};

SmartArticle.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default SmartArticle;
