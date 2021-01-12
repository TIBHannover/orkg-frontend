import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Button, FormGroup, Label, FormText, ButtonGroup } from 'reactstrap';
import { classesUrl, getClassById } from 'services/backend/classes';
import { updateResourceClasses as updateResourceClassesNetwork } from 'services/backend/resources';
import { getResource } from 'services/backend/resources';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import { EditModeHeader, Title } from 'pages/ViewPaper';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import InternalServerError from 'pages/InternalServerError';
import SameAsStatements from '../SameAsStatements';
import EditableHeader from 'components/EditableHeader';
import ObjectStatements from 'components/ObjectStatements/ObjectStatements';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { useLocation, Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import Tippy from '@tippy.js/react';
import ROUTES from 'constants/routes.js';
import { connect, useSelector } from 'react-redux';
import { resetStatementBrowser } from 'actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faExternalLinkAlt, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import Confirm from 'components/ConfirmationModal/ConfirmationModal';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { orderBy } from 'lodash';
import useDeleteResource from 'components/Resource/hooks/useDeleteResource';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';

const DEDICATED_PAGE_LINKS = {
    [CLASSES.PAPER]: {
        label: 'Paper',
        route: ROUTES.VIEW_PAPER,
        routeParams: 'resourceId'
    },
    [CLASSES.PROBLEM]: {
        label: 'Research problem',
        route: ROUTES.RESEARCH_PROBLEM,
        routeParams: 'researchProblemId'
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
        routeParams: 'researchFieldId'
    },
    [CLASSES.VENUE]: {
        label: 'Venue',
        route: ROUTES.VENUE_PAGE,
        routeParams: 'venueId'
    },
    [CLASSES.CONTRIBUTION_TEMPLATE]: {
        label: 'Template',
        route: ROUTES.CONTRIBUTION_TEMPLATE,
        routeParams: 'id'
    },
    [CLASSES.CONTRIBUTION]: {
        label: 'Contribution',
        route: ROUTES.CONTRIBUTION,
        routeParams: 'id'
    }
};
function Resource(props) {
    const resourceId = props.match.params.id;
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [canBeDeleted, setCanBeDeleted] = useState(false);
    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const showDeleteButton = editMode && isCurationAllowed;
    const [hasObjectStatement, setHasObjectStatement] = useState(false);
    const { deleteResource } = useDeleteResource({ resourceId, redirect: true });
    const [canEdit, setCanEdit] = useState(false);
    const classesAutocompleteRef = useRef(null);

    useEffect(() => {
        const findResource = async () => {
            setIsLoading(true);
            getResource(resourceId)
                .then(responseJson => {
                    document.title = `${responseJson.label} - Resource - ORKG`;
                    const classesCalls = responseJson.classes.map(classResource => getClassById(classResource));
                    Promise.all(classesCalls)
                        .then(classes => {
                            classes = orderBy(classes, [classLabel => classLabel.label.toLowerCase()], ['asc']);
                            setLabel(responseJson.label);
                            setClasses(classes);
                        })
                        .then(() => {
                            if (responseJson.classes.includes(CLASSES.COMPARISON)) {
                                getStatementsBySubjectAndPredicate({ subjectId: props.match.params.id, predicateId: PREDICATES.HAS_DOI }).then(st => {
                                    if (st.length > 0) {
                                        setIsLoading(false);
                                        setCanEdit(false);
                                    } else {
                                        setIsLoading(false);
                                        setCanEdit(true);
                                    }
                                });
                            } else {
                                setIsLoading(false);
                                setCanEdit(true);
                            }
                        });
                })
                .catch(err => {
                    console.error(err);
                    setLabel(null);
                    setError(err);
                    setIsLoading(false);
                });
        };
        findResource();
    }, [location, props.match.params.id, resourceId]);

    useEffect(() => {
        setCanBeDeleted((values.allIds.length === 0 || properties.allIds.length === 0) && !hasObjectStatement);
    }, [values, properties, hasObjectStatement]);

    const handleClassSelect = async (selected, action) => {
        if (action.action === 'create-option') {
            const foundIndex = selected.findIndex(x => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label
            });
            if (newClass) {
                const foundIndex = selected.findIndex(x => x.__isNew__);
                selected[foundIndex] = newClass;
            } else {
                return null;
            }
        }
        const newClasses = !selected ? [] : selected;
        // Reset the statement browser and rely on React attribute 'key' to reinitialize the statement browser
        // (When a key changes, React will create a new component instance rather than update the current one)
        props.resetStatementBrowser();
        setClasses(newClasses);
        await updateResourceClassesNetwork(resourceId, newClasses.map(c => c.id));
        toast.success('Resource classes updated successfully');
    };

    const handleHeaderChange = event => {
        setLabel(event.value);
    };

    const getDedicatedLink = useCallback(() => {
        for (const _class of classes) {
            if (_class.id in DEDICATED_PAGE_LINKS) {
                // only for a link for the first class occurrence (to prevent problems when a
                // resource has multiple classes form the list), so return
                return DEDICATED_PAGE_LINKS[_class.id];
            }
        }
        return;
    }, [classes]);

    const dedicatedLink = getDedicatedLink();

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <Container className="d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Resource view</h1>
                        <ButtonGroup className="flex-shrink-0">
                            <Button color="darkblue" size="sm" tag={Link} to={ROUTES.ADD_RESOURCE} style={{ marginRight: 2 }}>
                                <Icon icon={faPlus} className="mr-1" /> Create resource
                            </Button>
                            {dedicatedLink && (
                                <Button
                                    color="darkblue"
                                    size="sm"
                                    tag={Link}
                                    to={reverse(dedicatedLink.route, { [dedicatedLink.routeParams]: props.match.params.id })}
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
                                        color="darkblue"
                                        size="sm"
                                        onClick={() => setEditMode(v => !v)}
                                    >
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="flex-shrink-0" color="darkblueDarker" size="sm" onClick={() => setEditMode(v => !v)}>
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )
                            ) : (
                                <Tippy hideOnClick={false} content="This resource can not be edited because it has a published DOI.">
                                    <span className="btn btn-darkblue btn-sm disabled">
                                        <Icon icon={faPen} /> <span>Edit</span>
                                    </span>
                                </Tippy>
                            )}
                        </ButtonGroup>
                    </Container>

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
                                        {label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </h3>
                                    {classes.length > 0 && (
                                        <span style={{ fontSize: '90%' }}>
                                            Classes:{' '}
                                            {classes.map((classObject, index) => {
                                                const separator = index < classes.length - 1 ? ', ' : '';

                                                return (
                                                    <i key={index}>
                                                        <Link to={reverse(ROUTES.CLASS, { id: classObject.id })}>{classObject.label}</Link>
                                                        {separator}
                                                    </i>
                                                );
                                            })}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <EditableHeader id={props.match.params.id} value={label} onChange={handleHeaderChange} />
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
                                    <FormGroup className="mb-4 mt-3">
                                        <Label for="classes-autocomplete">Classes</Label>
                                        <AutoComplete
                                            requestUrl={classesUrl}
                                            onChange={(selected, action) => {
                                                // blur the field allows to focus and open the menu again
                                                classesAutocompleteRef.current && classesAutocompleteRef.current.blur();
                                                handleClassSelect(selected, action);
                                            }}
                                            placeholder="No Classes"
                                            value={classes}
                                            autoLoadOption={true}
                                            openMenuOnFocus={true}
                                            allowCreate={true}
                                            isClearable
                                            innerRef={classesAutocompleteRef}
                                            isMulti
                                            autoFocus={false}
                                            ols={true}
                                            inputId="classes-autocomplete"
                                        />
                                        {editMode && <FormText>Specify the classes of the resource.</FormText>}
                                    </FormGroup>
                                </>
                            )}
                        </div>
                        <hr />
                        <h3 className="h5">Statements</h3>
                        <div className="clearfix">
                            <StatementBrowser
                                key={`SB${classes.map(c => c.id).join(',')}`}
                                enableEdit={editMode && canEdit}
                                syncBackend={editMode}
                                openExistingResourcesInDialog={false}
                                initialSubjectId={resourceId}
                                initialSubjectLabel={label}
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
