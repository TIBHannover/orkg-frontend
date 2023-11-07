import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import SameAsStatements from 'components/ExternalDescription/SameAsStatements';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/Breadcrumbs';
import ClassesItem from 'components/StatementBrowser/ClassesItem/ClassesItem';
import NoData from 'components/StatementBrowser/NoData/NoData';
import NotFound from 'components/StatementBrowser/NotFound/NotFound';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import StatementItemWrapper from 'components/StatementBrowser/StatementItem/StatementItemWrapper';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { isArray } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import FlipMove from 'react-flip-move';
import { useDispatch, useSelector } from 'react-redux';
import { Col, ListGroup, Row } from 'reactstrap';
import {
    getSuggestedProperties,
    initializeWithoutContribution,
    initializeWithResource,
    setInitialPath,
    updateSettings,
} from 'slices/statementBrowserSlice';
import ItemPreviewFactory from 'components/StatementBrowser/ValueItem/ItemPreviewFactory/ItemPreviewFactory';
import StatementMenuHeader from 'components/StatementBrowser/Statements/StatementMenuHeader/StatementMenuHeader';

const Statements = ({
    openExistingResourcesInDialog = false,
    initialSubjectId = null,
    initialSubjectLabel = null,
    propertiesAsLinks = false,
    resourcesAsLinks = false,
    keyToKeepStateOnLocationChange = null,
    renderTemplateBox = false,
    propertySuggestionsComponent: propertySuggestionsComponentProp = null,
    syncBackend: syncBackendProp,
    initOnLocationChange,
    rootNodeType,
    initialPath,
    newStore,
    canEditSharedRootLevel,
    enableEdit,
    showExternalDescriptions,
}) => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const level = useSelector(state => state.statementBrowser.level);
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const dispatch = useDispatch();

    // If the resource exist, all changes are synced to the backend automatically
    const syncBackend = !syncBackendProp ? !!resource.isExistingValue : syncBackendProp;

    useEffect(() => {
        if (initialSubjectId) {
            if (newStore) {
                dispatch(
                    initializeWithoutContribution({
                        resourceId: initialSubjectId,
                        label: initialSubjectLabel,
                        rootNodeType,
                    }),
                );
            } else {
                dispatch(
                    initializeWithResource({
                        resourceId: initialSubjectId,
                        label: initialSubjectLabel,
                    }),
                );
            }
            dispatch(
                updateSettings({
                    openExistingResourcesInDialog,
                    propertiesAsLinks,
                    resourcesAsLinks,
                    initOnLocationChange,
                    keyToKeepStateOnLocationChange,
                }),
            );

            dispatch(setInitialPath(initialPath));
        } else {
            dispatch(
                updateSettings({
                    initOnLocationChange,
                    keyToKeepStateOnLocationChange,
                }),
            );
        }
    }, [
        dispatch,
        initOnLocationChange,
        initialSubjectId,
        initialSubjectLabel,
        keyToKeepStateOnLocationChange,
        newStore,
        openExistingResourcesInDialog,
        propertiesAsLinks,
        resourcesAsLinks,
        rootNodeType,
        initialPath,
    ]);

    const statements = () => {
        let propertyIds = [];
        let shared = 1;
        const propertySuggestionsComponent = propertySuggestionsComponentProp || <PropertySuggestions />;
        if (resource && selectedResource) {
            propertyIds = resource && isArray(resource.propertyIds) ? resource.propertyIds : [];
            shared = resource?.shared ?? 0;
        }

        return (
            <ConditionalWrapper
                condition={!resourcesAsLinks && resource?.classes}
                wrapper={children => (
                    <ItemPreviewFactory id={selectedResource} classes={resource?.classes}>
                        {children}
                    </ItemPreviewFactory>
                )}
            >
                <div>
                    <Row>
                        <Col lg={propertySuggestionsComponentProp ? 9 : 12}>
                            <ClassesItem
                                enableEdit={(shared <= 1 || (canEditSharedRootLevel && level === 0)) && enableEdit}
                                syncBackend={syncBackend}
                            />
                            <ListGroup tag="div" className="listGroupEnlarge">
                                {selectedResource && !resource.isFetching ? (
                                    <>
                                        <FlipMove>
                                            {propertyIds.length > 0 &&
                                                propertyIds.map((propertyId, index) => (
                                                    <StatementItemWrapper
                                                        key={`statement-p${propertyId}r${selectedResource}`}
                                                        enableEdit={(shared <= 1 || (canEditSharedRootLevel && level === 0)) && enableEdit}
                                                        openExistingResourcesInDialog={openExistingResourcesInDialog}
                                                        isLastItem={propertyIds.length === index + 1}
                                                        isFirstItem={index === 0}
                                                        resourceId={selectedResource}
                                                        propertyId={propertyId}
                                                        syncBackend={syncBackend}
                                                        renderTemplateBox={renderTemplateBox}
                                                    />
                                                ))}
                                        </FlipMove>

                                        {!resource.isFailedFetching && propertyIds.length === 0 && <NoData enableEdit={enableEdit} />}
                                        {resource.isFailedFetching && propertyIds.length === 0 && <NotFound />}
                                    </>
                                ) : (
                                    <StyledStatementItem>
                                        <Icon icon={faSpinner} spin /> Loading
                                    </StyledStatementItem>
                                )}

                                {(shared <= 1 || (canEditSharedRootLevel && level === 0)) && enableEdit && (
                                    <AddProperty resourceId={selectedResource} syncBackend={syncBackend} />
                                )}
                            </ListGroup>
                        </Col>
                        {(shared <= 1 || (canEditSharedRootLevel && level === 0)) &&
                            enableEdit &&
                            suggestedProperties.length > 0 &&
                            propertySuggestionsComponent}
                    </Row>
                </div>
            </ConditionalWrapper>
        );
    };

    const addLevel = (_level, maxLevel) =>
        maxLevel !== 0 ? (
            <StyledLevelBox>
                {maxLevel !== _level + 1 && addLevel(_level + 1, maxLevel)}
                {maxLevel === _level + 1 && statements()}
            </StyledLevelBox>
        ) : (
            statements()
        );

    const elements = addLevel(0, level);

    return (
        <>
            {resource && (
                <StatementMenuHeader
                    enableEdit={enableEdit}
                    canEdit={resource?.shared <= 1 || (canEditSharedRootLevel && level === 0)}
                    syncBackend={syncBackendProp}
                    resource={resource}
                />
            )}

            <>
                {level !== 0 && <Breadcrumbs />}
                {elements}

                {showExternalDescriptions && <SameAsStatements />}
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
            label: PropTypes.string.isRequired,
        }),
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
    canEditSharedRootLevel: PropTypes.bool.isRequired,
};

export default Statements;
