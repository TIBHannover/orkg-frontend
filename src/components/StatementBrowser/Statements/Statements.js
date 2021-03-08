import { useState, useEffect } from 'react';
import { ListGroup, Button } from 'reactstrap';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/Breadcrumbs';
import Template from 'components/StatementBrowser/Template/Template';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { RESOURCE_TYPE_ID } from 'constants/misc';
import { useCookies } from 'react-cookie';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    canAddProperty as canAddPropertyFunction,
    getSuggestedProperties,
    initializeWithoutContribution,
    initializeWithResource,
    updateSettings
} from 'actions/statementBrowser';

const Statements = props => {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const values = useSelector(state => state.statementBrowser.values);
    const properties = useSelector(state => state.statementBrowser.properties);
    const level = useSelector(state => state.statementBrowser.level);

    const canAddProperty = useSelector(state => canAddPropertyFunction(state, selectedResource));
    const suggestedProperties = useSelector(state => getSuggestedProperties(state, selectedResource));
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const dispatch = useDispatch();
    const [cookies] = useCookies(['showedValueHelp']);
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
            propertyIds = resource ? resource.propertyIds : [];
            shared = resource ? resource.shared : 0;
        }

        return (
            <div>
                {/*props.selectedResource && props.resources.byId[props.selectedResource].classes.length > 0 && (
                    <div className="text-muted mb-2">Classes: {props.resources.byId[props.selectedResource].classes.join(',')}</div>
                )*/}
                <ListGroup className="listGroupEnlarge">
                    {selectedResource && !resource.isFetching ? (
                        propertyIds.length > 0 ? (
                            propertyIds.map((propertyId, index) => {
                                const property = properties.byId[propertyId];
                                if (!property.isTemplate) {
                                    return (
                                        <StatementItem
                                            key={`statement-p${propertyId}r${selectedResource}`}
                                            id={propertyId}
                                            property={property}
                                            predicateLabel={property.label}
                                            enableEdit={shared <= 1 ? props.enableEdit : false}
                                            syncBackend={props.syncBackend}
                                            isAnimated={property.isAnimated}
                                            resourceId={selectedResource}
                                            isLastItem={propertyIds.length === index + 1}
                                            showValueHelp={cookies && !cookies.showedValueHelp && index === 0 ? true : false}
                                        />
                                    );
                                } else {
                                    return property.valueIds.map(valueId => {
                                        const value = values.byId[valueId];
                                        return (
                                            <Template
                                                key={`template-v${valueId}`}
                                                id={valueId}
                                                value={value}
                                                propertyId={propertyId}
                                                selectedResource={selectedResource}
                                                enableEdit={props.enableEdit}
                                                syncBackend={props.syncBackend}
                                                openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                                isAnimated={property.isAnimated}
                                            />
                                        );
                                    });
                                }
                            })
                        ) : (
                            <NoData enableEdit={props.enableEdit} templatesFound={props.templatesFound} />
                        )
                    ) : (
                        <StyledStatementItem>
                            <Icon icon={faSpinner} spin /> Loading
                        </StyledStatementItem>
                    )}

                    {shared <= 1 && props.enableEdit && <AddProperty isDisabled={!canAddProperty} syncBackend={props.syncBackend} />}
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
    keyToKeepStateOnLocationChange: PropTypes.string
};

Statements.defaultProps = {
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
    rootNodeType: RESOURCE_TYPE_ID
};

export default Statements;
