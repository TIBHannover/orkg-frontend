import { useState, useEffect, useCallback } from 'react';
import { Container, Button, UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import InternalServerError from 'pages/InternalServerError';
import EditableHeader from 'components/EditableHeader';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import CONTENT_TYPES from 'constants/contentTypes';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExternalLinkAlt, faTimes, faPlus, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { ENTITIES } from 'constants/graphSettings';
import useDeleteResource from 'components/Resource/hooks/useDeleteResource';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { reverseWithSlug } from 'utils';
import TitleBar from 'components/TitleBar/TitleBar';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import ItemMetadata from 'components/Search/ItemMetadata';
import TabsContainer from 'components/Resource/Tabs/TabsContainer';
import DEDICATED_PAGE_LINKS from 'components/Resource/hooks/redirectionSettings';
import useQuery from 'components/Resource/hooks/useQuery';
import getPreventEditCase from 'components/Resource/hooks/preventEditing';
import PreventModal from 'components/Resource/PreventModal/PreventModal';
import GraphViewModal from 'components/GraphView/GraphViewModal';

function Resource() {
    const { id } = useParams();
    const navigate = useNavigate();
    const query = useQuery();
    const noRedirect = query.get('noRedirect');
    const [error, setError] = useState(null);
    const [resource, setResource] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [preventEditCase, setPreventEditCase] = useState(null);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const { deleteResource } = useDeleteResource({ resourceId: id, redirect: true });
    const [isOpenPreventModal, setIsOpenPreventModal] = useState(false);
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: resource?.unlisted,
        featured: resource?.featured,
    });

    const getDedicatedLink = useCallback(_classes => {
        for (const _class of _classes ?? []) {
            if (_class in DEDICATED_PAGE_LINKS) {
                // only for a link for the first class occurrence (to prevent problems when a
                // resource has multiple classes form the list), so return
                return DEDICATED_PAGE_LINKS[_class];
            }
        }
        return null;
    }, []);

    useEffect(() => {
        const findResource = async () => {
            setIsLoading(true);
            getResource(id)
                .then(async responseJson => {
                    document.title = `${responseJson.label} - Resource - ORKG`;
                    setResource(responseJson);
                    const link = getDedicatedLink(responseJson.classes);
                    if (noRedirect === null && link) {
                        navigate(
                            reverseWithSlug(link.route, {
                                [link.routeParams]: id,
                                slug: link.hasSlug ? responseJson.label : undefined,
                            }),
                            { replace: true },
                        );
                    }
                    const prevent = await getPreventEditCase(responseJson);
                    setPreventEditCase(prevent);
                    setIsLoading(false);
                })
                .catch(err => {
                    setResource(null);
                    setError(err);
                    setIsLoading(false);
                });
        };
        findResource();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isCurationAllowed, getDedicatedLink]);

    const handleHeaderChange = val => {
        setResource(prev => ({ ...prev, label: val }));
    };

    const dedicatedLink = getDedicatedLink(resource?.classes);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                <RequireAuthentication
                                    size="sm"
                                    component={Button}
                                    color="secondary"
                                    style={{ marginRight: 2 }}
                                    tag={Link}
                                    to={ROUTES.ADD_RESOURCE}
                                >
                                    <Icon icon={faPlus} className="me-1" /> Create resource
                                </RequireAuthentication>
                                {dedicatedLink && (
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        tag={Link}
                                        to={reverseWithSlug(dedicatedLink.route, {
                                            [dedicatedLink.routeParams]: id,
                                            slug: dedicatedLink.hasSlug ? resource.label : undefined,
                                        })}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faExternalLinkAlt} className="me-1" /> {dedicatedLink.label} view
                                    </Button>
                                )}
                                {!editMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => (!isCurationAllowed && preventEditCase ? setIsOpenPreventModal(true) : setEditMode(v => !v))}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                {editMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                <UncontrolledButtonDropdown>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <Icon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end>
                                        <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </>
                        }
                    >
                        Resource view
                    </TitleBar>
                    {editMode && preventEditCase?.warningOnEdit && preventEditCase.warningOnEdit}
                    <EditModeHeader isVisible={editMode} />
                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        {!editMode ? (
                            <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {resource.label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                                {resource?.classes?.some(c => CONTENT_TYPES.includes(c)) && (
                                    <span className="ms-2">
                                        <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                        <div className="d-inline-block ms-1">
                                            <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                        </div>
                                    </span>
                                )}
                            </h3>
                        ) : (
                            <>
                                <EditableHeader id={id} value={resource.label} onChange={handleHeaderChange} entityType={ENTITIES.RESOURCE} />
                                {editMode && isCurationAllowed && (
                                    <Button color="danger" size="sm" className="mt-2 mb-3" style={{ marginLeft: 'auto' }} onClick={deleteResource}>
                                        <Icon icon={faTrash} /> Delete resource
                                    </Button>
                                )}
                            </>
                        )}

                        <ItemMetadata item={resource} showCreatedAt={true} showCreatedBy={true} showProvenance={true} editMode={editMode} />
                    </Container>
                    <TabsContainer classes={resource?.classes} id={id} editMode={editMode} />

                    {preventEditCase && (
                        <PreventModal
                            {...preventEditCase.preventModalProps(resource)}
                            isOpen={isOpenPreventModal}
                            toggle={() => setIsOpenPreventModal(v => !v)}
                        />
                    )}
                </>
            )}

            {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal(v => !v)} resourceId={resource.id} />}
        </>
    );
}

export default Resource;
