import { useState, useEffect, useCallback } from 'react';
import { Container, Button, Alert } from 'reactstrap';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import { EditModeHeader, Title } from 'pages/ViewPaper';
import InternalServerError from 'pages/InternalServerError';
import SameAsStatements from '../SameAsStatements';
import EditableHeader from 'components/EditableHeader';
import ObjectStatements from 'components/ObjectStatements/ObjectStatements';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { useLocation, Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes.js';
import { connect, useSelector } from 'react-redux';
import { resetStatementBrowser } from 'actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExternalLinkAlt, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import useDeleteResource from 'components/Resource/hooks/useDeleteResource';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import env from '@beam-australia/react-env';
import { getVisualization } from 'services/similarity';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { reverseWithSlug } from 'utils';
import PapersWithCodeModal from 'components/PapersWithCodeModal/PapersWithCodeModal';
import TitleBar from 'components/TitleBar/TitleBar';

const DEDICATED_PAGE_LINKS = {
    [CLASSES.PAPER]: {
        label: 'Paper',
        route: ROUTES.VIEW_PAPER,
        routeParams: 'resourceId'
    },
    [CLASSES.PROBLEM]: {
        label: 'Research problem',
        route: ROUTES.RESEARCH_PROBLEM,
        routeParams: 'researchProblemId',
        hasSlug: true
    },
    [CLASSES.COMPARISON]: {
        label: 'Comparison',
        route: ROUTES.COMPARISON,
        routeParams: 'comparisonId'
    },
    [CLASSES.AUTHOR]: {
        label: 'Author',
        route: ROUTES.AUTHOR_PAGE,
        routeParams: 'authorId'
    },
    [CLASSES.RESEARCH_FIELD]: {
        label: 'Research field',
        route: ROUTES.RESEARCH_FIELD,
        routeParams: 'researchFieldId',
        hasSlug: true
    },
    [CLASSES.VENUE]: {
        label: 'Venue',
        route: ROUTES.VENUE_PAGE,
        routeParams: 'venueId'
    },
    [CLASSES.TEMPLATE]: {
        label: 'Template',
        route: ROUTES.TEMPLATE,
        routeParams: 'id'
    },
    [CLASSES.CONTRIBUTION]: {
        label: 'Contribution',
        route: ROUTES.CONTRIBUTION,
        routeParams: 'id'
    },
    [CLASSES.SMART_REVIEW]: {
        label: 'SmartReview',
        route: ROUTES.SMART_REVIEW,
        routeParams: 'id'
    },
    [CLASSES.SMART_REVIEW_PUBLISHED]: {
        label: 'SmartReview',
        route: ROUTES.SMART_REVIEW,
        routeParams: 'id'
    }
};
function Resource(props) {
    const resourceId = props.match.params.id;
    const location = useLocation();
    const [error, setError] = useState(null);
    const [resource, setResource] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [canBeDeleted, setCanBeDeleted] = useState(false);
    const [visualizationModelForGDC, setVisualizationModelForGDC] = useState(undefined);
    const [hasVisualizationModelForGDC, setHasVisualizationModelForGDC] = useState(false);
    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const showDeleteButton = editMode && isCurationAllowed;
    const [hasObjectStatement, setHasObjectStatement] = useState(false);
    const [hasDOI, setHasDOI] = useState(false);
    const { deleteResource } = useDeleteResource({ resourceId, redirect: true });
    const [canEdit, setCanEdit] = useState(false);
    const [createdBy, setCreatedBy] = useState(null);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);

    useEffect(() => {
        const findResource = async () => {
            setIsLoading(true);
            getResource(resourceId)
                .then(responseJson => {
                    document.title = `${responseJson.label} - Resource - ORKG`;
                    setCreatedBy(responseJson.created_by);
                    setResource(responseJson);
                    if (responseJson.classes.includes(CLASSES.VISUALIZATION)) {
                        getVisualization(resourceId)
                            .then(model => {
                                setVisualizationModelForGDC(model);
                                setHasVisualizationModelForGDC(true);
                            })
                            .catch(() => {
                                setVisualizationModelForGDC(undefined);
                                setHasVisualizationModelForGDC(false);
                                toast.error('Error loading visualization preview');
                            });
                    } else {
                        setVisualizationModelForGDC(undefined);
                        setHasVisualizationModelForGDC(false);
                    }
                    if (responseJson.classes.includes(CLASSES.COMPARISON)) {
                        getStatementsBySubjectAndPredicate({ subjectId: props.match.params.id, predicateId: PREDICATES.HAS_DOI }).then(st => {
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
                    console.error(err);
                    setResource(null);
                    setError(err);
                    setIsLoading(false);
                });
        };
        findResource();
    }, [location, props.match.params.id, resourceId, isCurationAllowed]);

    useEffect(() => {
        setCanBeDeleted((values.allIds.length === 0 || properties.allIds.length === 0) && !hasObjectStatement);
    }, [values, properties, hasObjectStatement]);

    const handleHeaderChange = event => {
        setResource(prev => ({ ...prev, label: event.value }));
    };

    const getDedicatedLink = useCallback(() => {
        for (const _class of resource?.classes ?? []) {
            if (_class in DEDICATED_PAGE_LINKS) {
                // only for a link for the first class occurrence (to prevent problems when a
                // resource has multiple classes form the list), so return
                return DEDICATED_PAGE_LINKS[_class];
            }
        }
        return null;
    }, [resource.classes]);

    const dedicatedLink = getDedicatedLink();

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
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
                                    <Icon icon={faPlus} className="mr-1" /> Create resource
                                </RequireAuthentication>
                                {dedicatedLink && (
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        tag={Link}
                                        to={reverseWithSlug(dedicatedLink.route, {
                                            [dedicatedLink.routeParams]: props.match.params.id,
                                            slug: dedicatedLink.hasSlug ? resource.label : undefined
                                        })}
                                        style={{ marginRight: 2 }}
                                    >
                                        <Icon icon={faExternalLinkAlt} className="mr-1" /> {dedicatedLink.label} view
                                    </Button>
                                )}
                                {canEdit ? (
                                    !editMode ? (
                                        <RequireAuthentication
                                            component={Button}
                                            className="float-right"
                                            color="secondary"
                                            size="sm"
                                            onClick={() => (env('PWC_USER_ID') === createdBy ? setIsOpenPWCModal(true) : setEditMode(v => !v))}
                                        >
                                            <Icon icon={faPen} /> Edit
                                        </RequireAuthentication>
                                    ) : (
                                        <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                            <Icon icon={faTimes} /> Stop editing
                                        </Button>
                                    )
                                ) : (
                                    <Tippy
                                        hideOnClick={false}
                                        interactive={resource.classes.find(c => c.id === CLASSES.RESEARCH_FIELD) ? true : false}
                                        content={
                                            env('PWC_USER_ID') === createdBy ? (
                                                'This resource cannot be edited because it is from an external source. Our provenance feature is in active development.'
                                            ) : resource.classes.find(c => c.id === CLASSES.RESEARCH_FIELD) ? (
                                                <>
                                                    This resource can not be edited. Please visit the{' '}
                                                    <a
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        href="https://www.orkg.org/orkg/help-center/article/20/ORKG_Research_fields_taxonomy"
                                                    >
                                                        ORKG help center
                                                    </a>{' '}
                                                    if you have any suggestions to improve the research fields taxonomy.
                                                </>
                                            ) : (
                                                'This resource can not be edited because it has a published DOI.'
                                            )
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
                    {editMode && canEdit && (
                        <EditModeHeader className="box rounded-top">
                            <Title>
                                Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                            </Title>
                        </EditModeHeader>
                    )}
                    <Container className={`box clearfix pt-4 pb-4 pl-5 pr-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="mb-2">
                            {!editMode || !canEdit ? (
                                <div className="pb-2 mb-3">
                                    <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {resource.label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </h3>
                                </div>
                            ) : (
                                <>
                                    <EditableHeader id={props.match.params.id} value={resource.label} onChange={handleHeaderChange} />
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
                                                className="mt-2"
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
                        </div>
                        <hr />

                        {/*Adding Visualization Component here */}
                        {hasVisualizationModelForGDC && (
                            <div className="mb-4">
                                <GDCVisualizationRenderer model={visualizationModelForGDC} />
                                <hr />
                            </div>
                        )}
                        <h3 className="h5">Statements</h3>
                        <div className="clearfix">
                            <StatementBrowser
                                key={`SB${resource.classes.map(c => c.id).join(',')}`}
                                enableEdit={editMode && canEdit}
                                syncBackend={editMode}
                                openExistingResourcesInDialog={false}
                                initialSubjectId={resourceId}
                                initialSubjectLabel={resource.label}
                                newStore={true}
                                propertiesAsLinks={true}
                                resourcesAsLinks={true}
                            />

                            <SameAsStatements />
                        </div>
                        <ObjectStatements resourceId={props.match.params.id} setHasObjectStatement={setHasObjectStatement} />
                    </Container>
                </>
            )}
            <PapersWithCodeModal isOpen={isOpenPWCModal} toggle={() => setIsOpenPWCModal(v => !v)} />
        </>
    );
}

Resource.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    resetStatementBrowser: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    resetStatementBrowser: data => dispatch(resetStatementBrowser())
});

export default connect(
    null,
    mapDispatchToProps
)(Resource);
