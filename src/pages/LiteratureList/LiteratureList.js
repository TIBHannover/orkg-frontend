import { faCheckCircle, faEllipsisV, faHistory, faPen, faSpinner, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { setIsEditing, toggleHistoryModal as toggleHistoryModalAction } from 'actions/literatureList';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import EditList from 'components/LiteratureList/EditList';
import HistoryModal from 'components/LiteratureList/HistoryModal';
import useLiteratureList from 'components/LiteratureList/hooks/useLiteratureList';
import PublishModal from 'components/LiteratureList/PublishModal';
import ViewList from 'components/LiteratureList/ViewList';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import LoadingArticle from 'components/ArticleBuilder/LoadingArticle';
import LoadingOverlay from 'components/ArticleBuilder/LoadingOverlay';
import { SubTitle } from 'components/styled';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useHistory, useParams } from 'react-router-dom';
import { Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import Confirm from 'reactstrap-confirm';

const LiteratureList = () => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const { id } = useParams();
    const isPublished = useSelector(state => state.literatureList.isPublished);
    const list = useSelector(state => state.literatureList.literatureList);
    const isEditing = useSelector(state => state.literatureList.isEditing);
    const isOpenHistoryModal = useSelector(state => state.literatureList.isOpenHistoryModal);
    const researchField = useSelector(state => state.literatureList.researchField);
    const isLoadingInline = useSelector(state => state.literatureList.isLoading);
    const versions = useSelector(state => state.literatureList.versions);
    const version = versions.find(version => version.id === id);
    const publicationDate = version ? moment(version.date).format('DD MMMM YYYY') : null;
    const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
    const dispatch = useDispatch();
    const history = useHistory();
    const toggleHistoryModal = () => dispatch(toggleHistoryModalAction());
    const { load, isLoading, isNotFound, getVersions } = useLiteratureList();

    useEffect(() => {
        load(id);
    }, [id, load]);

    useEffect(() => {
        let title = 'Literature list - ORKG';
        if (list.title) {
            title = `${list.title} - Literature list - ORKG`;
        }
        document.title = title;
    }, [list.title]);

    const handleEdit = async () => {
        if (isPublished) {
            const isConfirmed = await Confirm({
                title: 'This is a published list',
                message: `The list you are viewing is published, which means it cannot be modified. To make changes, fetch the live data and try this action again`,
                cancelColor: 'light',
                confirmText: 'Fetch live data'
            });

            if (isConfirmed) {
                history.push(reverse(ROUTES.LITERATURE_LIST, { id: list.id }));
            }
        } else {
            dispatch(setIsEditing(true));
        }
    };

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            {researchField && <Breadcrumbs researchFieldId={researchField.id} />}
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
                                    <Icon icon={faSpinner} spin className="mr-2 text-secondary" />
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
                            <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right">
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id })}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </>
                }
            >
                Literature list
            </TitleBar>
            <LoadingOverlay />

            {!isLoading && !isEditing && <ViewList />}
            {!isLoading && isEditing && <EditList />}
            {isLoading && <LoadingArticle />}

            {isOpenPublishModal && (
                <PublishModal toggle={() => setIsOpenPublishModal(v => !v)} id={id} getVersions={getVersions} listId={list.id} show />
            )}
            {isOpenHistoryModal && <HistoryModal toggle={toggleHistoryModal} id={id} show />}
        </div>
    );
};

export default LiteratureList;
