import { useEffect } from 'react';
import { ListGroup, Button } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/Breadcrumbs';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import TemplatesModal from 'components/StatementBrowser/TemplatesModal/TemplatesModal';
import Tippy from '@tippyjs/react';
import StatementItemWrapper from 'components/StatementBrowser/StatementItem/StatementItemWrapper';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { isArray } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle, faPuzzlePiece, faCogs, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    setIsHelpModalOpen,
    setIsTemplateModalOpen,
    setIsPreferencesOpen,
    getSuggestedProperties,
    initializeWithoutContribution,
    initializeWithResource,
    updateSettings,
    setInitialPath
} from 'actions/statementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import ClassesItem from 'components/StatementBrowser/ClassesItem/ClassesItem';
import Preferences from 'components/StatementBrowser/Preferences/Preferences';

const Statements = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const isPreferencesOpen = useSelector(state => state.statementBrowser.isPreferencesOpen);
    const preferences = useSelector(state => state.statementBrowser.preferences);
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
        if (resource && selectedResource) {
            propertyIds = resource && isArray(resource.propertyIds) ? resource.propertyIds : [];
            shared = resource ? resource.shared : 0;
        }

        return (
            <div>
                {preferences['showClasses'] && <ClassesItem enableEdit={props.enableEdit} syncBackend={props.syncBackend} />}
                <ListGroup tag="div" className="listGroupEnlarge">
                    {selectedResource && !resource.isFetching ? (
                        propertyIds.length > 0 ? (
                            propertyIds.map((propertyId, index) => {
                                return (
                                    <StatementItemWrapper
                                        key={`statement-p${propertyId}r${selectedResource}`}
                                        enableEdit={props.enableEdit}
                                        openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                        isLastItem={propertyIds.length === index + 1}
                                        isFirstItem={index === 0}
                                        resourceId={selectedResource}
                                        propertyId={propertyId}
                                        shared={shared}
                                        syncBackend={props.syncBackend}
                                        renderTemplateBox={props.renderTemplateBox}
                                    />
                                );
                            })
                        ) : (
                            <NoData enableEdit={props.enableEdit} templatesFound={props.templatesFound} />
                        )
                    ) : (
                        <StyledStatementItem>
                            <Icon icon={faSpinner} spin /> Loading
                        </StyledStatementItem>
                    )}

                    {shared <= 1 && props.enableEdit && <AddProperty resourceId={selectedResource} syncBackend={props.syncBackend} />}
                    {shared <= 1 && props.enableEdit && suggestedProperties.length > 0 && <PropertySuggestions />}
                </ListGroup>
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
            {props.enableEdit && (
                <>
                    <div className="clearfix mb-3">
                        <span className="ml-3 float-right">
                            {/* We have custom templates for predicates and classes*/}
                            {resource._class === ENTITIES.RESOURCE && (
                                <>
                                    <Tippy content="Select a template to use it in your data">
                                        <span>
                                            <Button
                                                outline
                                                color="secondary"
                                                size="sm"
                                                onClick={() => dispatch(setIsTemplateModalOpen({ isOpen: true }))}
                                            >
                                                <Icon className="mr-1" icon={faPuzzlePiece} /> Templates
                                            </Button>
                                        </span>
                                    </Tippy>
                                    <TemplatesModal syncBackend={props.syncBackend} />
                                </>
                            )}
                            <Button
                                className="ml-2"
                                outline
                                color="secondary"
                                size="sm"
                                onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true }))}
                            >
                                <Icon className="mr-1" icon={faQuestionCircle} /> Help
                            </Button>
                            <Tippy content={isPreferencesOpen ? 'Close preferences' : 'Preferences'}>
                                <span>
                                    <Button
                                        className="ml-2 px-2"
                                        outline
                                        active={isPreferencesOpen}
                                        color="secondary"
                                        size="sm"
                                        onClick={() => dispatch(setIsPreferencesOpen(!isPreferencesOpen))}
                                    >
                                        <Icon fixedWidth={true} className="mr-1" icon={!isPreferencesOpen ? faCogs : faTimes} />
                                    </Button>
                                </span>
                            </Tippy>
                        </span>
                    </div>
                </>
            )}
            {(!isPreferencesOpen || !props.enableEdit) && (
                <>
                    {level !== 0 && <Breadcrumbs />}
                    {elements}
                </>
            )}
            {isPreferencesOpen && props.enableEdit && (
                <>
                    <Preferences />
                </>
            )}

            <SBEditorHelpModal />
        </>
    );
};
Statements.propTypes = {
    rootNodeType: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    initialSubjectId: PropTypes.string,
    initialSubjectLabel: PropTypes.string,
    initialPath: PropTypes.array(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired
        })
    ),
    syncBackend: PropTypes.bool.isRequired,
    newStore: PropTypes.bool,
    templatesFound: PropTypes.bool,
    propertiesAsLinks: PropTypes.bool,
    resourcesAsLinks: PropTypes.bool,
    initOnLocationChange: PropTypes.bool.isRequired,
    keyToKeepStateOnLocationChange: PropTypes.string,
    renderTemplateBox: PropTypes.bool
};

Statements.defaultProps = {
    enableEdit: false,
    openExistingResourcesInDialog: false,
    initialSubjectId: null,
    initialSubjectLabel: null,
    syncBackend: false,
    newStore: false,
    templatesFound: false,
    propertiesAsLinks: false,
    resourcesAsLinks: false,
    initOnLocationChange: true,
    keyToKeepStateOnLocationChange: null,
    rootNodeType: ENTITIES.RESOURCE,
    renderTemplateBox: false,
    initialPath: []
};

export default Statements;
