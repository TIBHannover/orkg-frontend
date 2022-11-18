import { useState, useEffect, useCallback } from 'react';
import { Container, Button, Alert } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import InternalServerError from 'pages/InternalServerError';
import EditableHeader from 'components/EditableHeader';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes.js';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExternalLinkAlt, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import useDeleteResource from 'components/Resource/hooks/useDeleteResource';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import env from '@beam-australia/react-env';
import MarkFeatured from 'components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from 'components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import useMarkFeaturedUnlisted from 'components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import { reverseWithSlug } from 'utils';
import PapersWithCodeModal from 'components/PapersWithCodeModal/PapersWithCodeModal';
import TitleBar from 'components/TitleBar/TitleBar';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import ItemMetadata from 'components/Search/ItemMetadata';
import TabsContainer from 'components/Resource/Tabs/TabsContainer';
import DEDICATED_PAGE_LINKS from 'components/Resource/hooks/redirectionSettings';
import useQuery from 'components/Resource/hooks/useQuery';

function Resource() {
    const params = useParams();
    const resourceId = params.id;
    const location = useLocation();
    const navigate = useNavigate();
    const query = useQuery();
    const noRedirect = query.get('noRedirect');
    const [error, setError] = useState(null);
    const [resource, setResource] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [canBeDeleted, setCanBeDeleted] = useState(false);
    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const showDeleteButton = editMode && isCurationAllowed;
    const [hasDOI, setHasDOI] = useState(false);
    const { deleteResource } = useDeleteResource({ resourceId, redirect: true });
    const [canEdit, setCanEdit] = useState(false);
    const [createdBy, setCreatedBy] = useState(null);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);
    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: params.id,
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
            getResource(resourceId)
                .then(responseJson => {
                    document.title = `${responseJson.label} - Resource - ORKG`;
                    setCreatedBy(responseJson.created_by);
                    setResource(responseJson);
                    const link = getDedicatedLink(responseJson.classes);
                    if (noRedirect === null && link) {
                        navigate(
                            reverseWithSlug(link.route, {
                                [link.routeParams]: params.id,
                                slug: link.hasSlug ? responseJson.label : undefined,
                            }),
                            { replace: true },
                        );
                    }

                    if (responseJson.classes.includes(CLASSES.COMPARISON)) {
                        getStatementsBySubjectAndPredicate({ subjectId: params.id, predicateId: PREDICATES.HAS_DOI }).then(st => {
                            if (st.length > 0) {
                                setIsLoading(false);
                                setHasDOI(true);
                                setCanEdit(isCurationAllowed);
                            } else {
                                setIsLoading(false);
                                if (env('PWC_USER_ID') === responseJson.created_by) {
                                    setCanEdit(false);
                                } else {
                                    setCanEdit(true);
                                }
                            }
                        });
                    } else if (responseJson.classes.includes(CLASSES.RESEARCH_FIELD)) {
                        setIsLoading(false);
                        setCanEdit(isCurationAllowed);
                    } else {
                        setIsLoading(false);
                        setCanEdit(true);
                    }
                })
                .catch(err => {
                    setResource(null);
                    setError(err);
                    setIsLoading(false);
                });
        };
        findResource();
    }, [location, params.id, resourceId, isCurationAllowed, getDedicatedLink, noRedirect, navigate]);

    useEffect(() => {
        setCanBeDeleted((values.allIds.length === 0 || properties.allIds.length === 0) && !resource.shared);
    }, [values, properties, resource.shared]);

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
                                            [dedicatedLink.routeParams]: params.id,
                                            slug: dedicatedLink.hasSlug ? resource.label : undefined,
                                        })}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faExternalLinkAlt} className="me-1" /> {dedicatedLink.label} view
                                    </Button>
                                )}
                                {canEdit && !editMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => (env('PWC_USER_ID') === createdBy ? setIsOpenPWCModal(true) : setEditMode(v => !v))}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                {canEdit && editMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                {!canEdit && !editMode && (
                                    <Tippy
                                        hideOnClick={false}
                                        interactive={!!resource.classes.find(c => c.id === CLASSES.RESEARCH_FIELD)}
                                        content={
                                            <>
                                                {env('PWC_USER_ID') === createdBy &&
                                                    'This resource cannot be edited because it is from an external source. Our provenance feature is in active development.'}
                                                {env('PWC_USER_ID') !== createdBy && resource.classes.find(c => c.id === CLASSES.RESEARCH_FIELD) && (
                                                    <>
                                                        This resource can not be edited. Please visit the{' '}
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href="https://www.orkg.org/help-center/article/20/ORKG_Research_fields_taxonomy"
                                                        >
                                                            ORKG help center
                                                        </a>{' '}
                                                        if you have any suggestions to improve the research fields taxonomy.
                                                    </>
                                                )}
                                                {env('PWC_USER_ID') !== createdBy &&
                                                    !resource.classes.find(c => c.id === CLASSES.RESEARCH_FIELD) &&
                                                    'This resource can not be edited because it has a published DOI.'}
                                            </>
                                        }
                                    >
                                        <span className="btn btn-secondary btn-sm disabled">
                                            <Icon icon={faPen} /> <span>Edit</span>
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        }
                    >
                        Resource view
                    </TitleBar>
                    {editMode && hasDOI && (
                        <Alert className="container" color="danger">
                            This resource should not be edited because it has a published DOI, please make sure that you know what are you doing!
                        </Alert>
                    )}
                    <EditModeHeader isVisible={editMode && canEdit} />
                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        {!editMode || !canEdit ? (
                            <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {resource.label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}{' '}
                                <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                <div className="d-inline-block ms-1">
                                    <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                </div>
                            </h3>
                        ) : (
                            <>
                                <EditableHeader id={params.id} value={resource.label} onChange={handleHeaderChange} entityType={ENTITIES.RESOURCE} />
                                {showDeleteButton && (
                                    <ConditionalWrapper
                                        condition={!canBeDeleted}
                                        wrapper={children => (
                                            <Tippy content="The resource cannot be deleted because it is used in statements (either as subject or object)">
                                                <span>{children}</span>
                                            </Tippy>
                                        )}
                                    >
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="mt-2 mb-3"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={deleteResource}
                                            disabled={!canBeDeleted}
                                        >
                                            <Icon icon={faTrash} /> Delete resource
                                        </Button>
                                    </ConditionalWrapper>
                                )}
                            </>
                        )}

                        <ItemMetadata item={resource} showCreatedAt={true} showCreatedBy={true} showProvenance={true} editMode={editMode} />
                    </Container>
                </>
            )}
            <TabsContainer classes={resource?.classes} id={resourceId} editMode={editMode} canEdit={canEdit} />
            <PapersWithCodeModal isOpen={isOpenPWCModal} toggle={() => setIsOpenPWCModal(v => !v)} />
        </>
    );
}

export default Resource;
