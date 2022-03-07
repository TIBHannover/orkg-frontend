import { useEffect } from 'react';
import { Col, ListGroup, Row } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/Breadcrumbs';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import StatementItemWrapper from 'components/StatementBrowser/StatementItem/StatementItemWrapper';
import NoData from 'components/StatementBrowser/NoData/NoData';
import NotFound from 'components/StatementBrowser/NotFound/NotFound';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import SameAsStatements from 'components/ExternalDescription/SameAsStatements';
import { isArray } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import FlipMove from 'react-flip-move';
import {
    getSuggestedProperties,
    initializeWithoutContribution,
    initializeWithResource,
    updateSettings,
    setInitialPath
} from 'actions/statementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import ClassesItem from 'components/StatementBrowser/ClassesItem/ClassesItem';
import StatementMenuHeader from './StatementMenuHeader/StatementMenuHeader';

const Statements = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const level = useSelector(state => state.statementBrowser.level);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (props.initialSubjectId) {
            if (props.newStore) {
                dispatch(
                    initializeWithoutContribution({
                        resourceId: props.initialSubjectId,
                        label: props.initialSubjectLabel,
                        rootNodeType: props.rootNodeType
                    })
                );
            } else {
                dispatch(
                    initializeWithResource({
                        resourceId: props.initialSubjectId,
                        label: props.initialSubjectLabel
                    })
                );
            }
            dispatch(
                updateSettings({
                    openExistingResourcesInDialog: props.openExistingResourcesInDialog,
                    propertiesAsLinks: props.propertiesAsLinks,
                    resourcesAsLinks: props.resourcesAsLinks,
                    initOnLocationChange: props.initOnLocationChange,
                    keyToKeepStateOnLocationChange: props.keyToKeepStateOnLocationChange
                })
            );

            dispatch(setInitialPath(props.initialPath));
        } else {
            dispatch(
                updateSettings({
                    initOnLocationChange: props.initOnLocationChange,
                    keyToKeepStateOnLocationChange: props.keyToKeepStateOnLocationChange
                })
            );
        }
    }, [
        dispatch,
        props.initOnLocationChange,
        props.initialSubjectId,
        props.initialSubjectLabel,
        props.keyToKeepStateOnLocationChange,
        props.newStore,
        props.openExistingResourcesInDialog,
        props.propertiesAsLinks,
        props.resourcesAsLinks,
        props.rootNodeType,
        props.initialPath
    ]);

    const statements = () => {
        let propertyIds = [];
        let shared = 1;
        const propertySuggestionsComponent = props.propertySuggestionsComponent || <PropertySuggestions />;
        if (resource && selectedResource) {
            propertyIds = resource && isArray(resource.propertyIds) ? resource.propertyIds : [];
            shared = resource?.shared ?? 0;
        }

        return (
            <div>
                <ClassesItem
                    enableEdit={(shared <= 1 || (props.canEditSharedRootLevel && level === 0)) && props.enableEdit}
                    syncBackend={props.syncBackend}
                />
                <Row>
                    <Col lg={props.propertySuggestionsComponent ? 9 : 12}>
                        <ListGroup tag="div" className="listGroupEnlarge">
                            {selectedResource && !resource.isFetching ? (
                                <>
                                    <FlipMove>
                                        {propertyIds.length > 0 &&
                                            propertyIds.map((propertyId, index) => {
                                                return (
                                                    <StatementItemWrapper
                                                        key={`statement-p${propertyId}r${selectedResource}`}
                                                        enableEdit={
                                                            (shared <= 1 || (props.canEditSharedRootLevel && level === 0)) && props.enableEdit
                                                        }
                                                        openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                                        isLastItem={propertyIds.length === index + 1}
                                                        isFirstItem={index === 0}
                                                        resourceId={selectedResource}
                                                        propertyId={propertyId}
                                                        syncBackend={props.syncBackend}
                                                        renderTemplateBox={props.renderTemplateBox}
                                                    />
                                                );
                                            })}
                                    </FlipMove>

                                    {!resource.isFailedFetching && propertyIds.length === 0 && <NoData enableEdit={props.enableEdit} />}
                                    {resource.isFailedFetching && propertyIds.length === 0 && <NotFound />}
                                </>
                            ) : (
                                <StyledStatementItem>
                                    <Icon icon={faSpinner} spin /> Loading
                                </StyledStatementItem>
                            )}

                            {(shared <= 1 || (props.canEditSharedRootLevel && level === 0)) && props.enableEdit && (
                                <AddProperty resourceId={selectedResource} syncBackend={props.syncBackend} />
                            )}
                        </ListGroup>
                    </Col>
                    {(shared <= 1 || (props.canEditSharedRootLevel && level === 0)) &&
                        props.enableEdit &&
                        suggestedProperties.length > 0 &&
                        propertySuggestionsComponent}
                </Row>
            </div>
        );
    };

    const addLevel = (_level, maxLevel) => {
        return maxLevel !== 0 ? (
            <StyledLevelBox>
                {maxLevel !== _level + 1 && addLevel(_level + 1, maxLevel)}
                {maxLevel === _level + 1 && statements()}
            </StyledLevelBox>
        ) : (
            statements()
        );
    };

    const elements = addLevel(0, level);

    return (
        <>
            {resource && (
                <StatementMenuHeader
                    enableEdit={props.enableEdit}
                    canEdit={resource?.shared <= 1 || (props.canEditSharedRootLevel && level === 0)}
                    syncBackend={props.syncBackend}
                    resource={resource}
                />
            )}

            <>
                {level !== 0 && <Breadcrumbs />}
                {elements}

                {props.showExternalDescriptions && <SameAsStatements />}
            </>
        </>
    );
};

Statements.propTypes = {
    rootNodeType: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    initialSubjectId: PropTypes.string,
    initialSubjectLabel: PropTypes.string,
    initialPath: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    syncBackend: PropTypes.bool.isRequired,
    newStore: PropTypes.bool,
    propertiesAsLinks: PropTypes.bool,
    resourcesAsLinks: PropTypes.bool,
    initOnLocationChange: PropTypes.bool.isRequired,
    showExternalDescriptions: PropTypes.bool.isRequired,
    propertySuggestionsComponent: PropTypes.node,
    keyToKeepStateOnLocationChange: PropTypes.string,
    renderTemplateBox: PropTypes.bool,
    canEditSharedRootLevel: PropTypes.bool.isRequired
};

Statements.defaultProps = {
    enableEdit: false,
    openExistingResourcesInDialog: false,
    initialSubjectId: null,
    initialSubjectLabel: null,
    syncBackend: false,
    newStore: false,
    propertiesAsLinks: false,
    resourcesAsLinks: false,
    initOnLocationChange: true,
    showExternalDescriptions: true,
    keyToKeepStateOnLocationChange: null,
    rootNodeType: ENTITIES.RESOURCE,
    renderTemplateBox: false,
    initialPath: [],
    canEditSharedRootLevel: true,
    propertySuggestionsComponent: null
};

export default Statements;
