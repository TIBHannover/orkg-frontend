import { useState, useEffect } from 'react';
import { ListGroup, Button } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/Breadcrumbs';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import StatementItemWrapper from 'components/StatementBrowser/StatementItem/StatementItemWrapper';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { RESOURCE_TYPE_ID } from 'constants/misc';
import { isArray } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { getSuggestedProperties, initializeWithoutContribution, initializeWithResource, updateSettings } from 'actions/statementBrowser';

const Statements = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const level = useSelector(state => state.statementBrowser.level);

    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const dispatch = useDispatch();
    const [helpModalOpen, setHelpModalOpen] = useState(false);

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
        props.rootNodeType
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
                {/*props.selectedResource && props.resources.byId[props.selectedResource].classes.length > 0 && (
                    <div className="text-muted mb-2">Classes: {props.resources.byId[props.selectedResource].classes.join(',')}</div>
                )*/}
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
                <div className="clearfix mb-3">
                    <span className="ml-3 float-right">
                        <Button outline color="secondary" size="sm" onClick={() => setHelpModalOpen(v => !v)}>
                            <Icon className="mr-1" icon={faQuestionCircle} /> Help
                        </Button>
                    </span>
                </div>
            )}

            {level !== 0 && <Breadcrumbs />}

            <SBEditorHelpModal isOpen={helpModalOpen} toggle={() => setHelpModalOpen(v => !v)} />
            {elements}
        </>
    );
};
Statements.propTypes = {
    rootNodeType: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    initialSubjectId: PropTypes.string,
    initialSubjectLabel: PropTypes.string,
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
    rootNodeType: RESOURCE_TYPE_ID,
    renderTemplateBox: false
};

export default Statements;
