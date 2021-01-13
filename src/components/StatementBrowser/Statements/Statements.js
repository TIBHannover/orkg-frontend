import { useState, useEffect } from 'react';
import { ListGroup, Button } from 'reactstrap';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/BreadcrumbsContainer';
import ContributionTemplate from 'components/StatementBrowser/ContributionTemplate/ContributionTemplateContainer';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { Cookies } from 'react-cookie';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default function Statements(props) {
    useEffect(() => {
        if (props.initialSubjectId) {
            if (props.newStore) {
                props.initializeWithoutContribution({
                    resourceId: props.initialSubjectId,
                    label: props.initialSubjectLabel,
                    rootNodeType: props.rootNodeType
                });
            } else {
                props.initializeWithResource({
                    resourceId: props.initialSubjectId,
                    label: props.initialSubjectLabel
                });
            }
            props.updateSettings({
                openExistingResourcesInDialog: props.openExistingResourcesInDialog,
                propertiesAsLinks: props.propertiesAsLinks,
                resourcesAsLinks: props.resourcesAsLinks,
                initOnLocationChange: props.initOnLocationChange,
                keyToKeepStateOnLocationChange: props.keyToKeepStateOnLocationChange
            });
        } else {
            props.updateSettings({
                initOnLocationChange: props.initOnLocationChange,
                keyToKeepStateOnLocationChange: props.keyToKeepStateOnLocationChange
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only once : https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects

    const [helpModalOpen, setHelpModalOpen] = useState(false);

    const statements = () => {
        let propertyIds = [];
        let shared = 1;
        if (Object.keys(props.resources.byId).length !== 0 && props.selectedResource) {
            propertyIds = props.resources.byId[props.selectedResource] ? props.resources.byId[props.selectedResource].propertyIds : [];
            shared = props.resources.byId[props.selectedResource] ? props.resources.byId[props.selectedResource].shared : 0;
        }

        return (
            <div>
                {/*props.selectedResource && props.resources.byId[props.selectedResource].classes.length > 0 && (
                    <div className="text-muted mb-2">Classes: {props.resources.byId[props.selectedResource].classes.join(',')}</div>
                )*/}
                <ListGroup className="listGroupEnlarge">
                    {props.selectedResource && !props.resources.byId[props.selectedResource].isFetching ? (
                        propertyIds.length > 0 ? (
                            propertyIds.map((propertyId, index) => {
                                const property = props.properties.byId[propertyId];
                                if (!property.isTemplate) {
                                    return (
                                        <StatementItem
                                            key={`statement-p${propertyId}r${props.selectedResource}`}
                                            id={propertyId}
                                            property={property}
                                            predicateLabel={property.label}
                                            enableEdit={shared <= 1 ? props.enableEdit : false}
                                            syncBackend={props.syncBackend}
                                            isAnimated={property.isAnimated}
                                            resourceId={props.selectedResource}
                                            isLastItem={propertyIds.length === index + 1}
                                            showValueHelp={props.cookies && !props.cookies.get('showedValueHelp') && index === 0 ? true : false}
                                        />
                                    );
                                } else {
                                    return property.valueIds.map(valueId => {
                                        const value = props.values.byId[valueId];
                                        return (
                                            <ContributionTemplate
                                                key={`template-v${valueId}`}
                                                id={valueId}
                                                value={value}
                                                propertyId={propertyId}
                                                selectedResource={props.selectedResource}
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

                    {shared <= 1 && props.enableEdit ? <AddProperty isDisabled={!props.canAddProperty} syncBackend={props.syncBackend} /> : ''}
                    {shared <= 1 && props.enableEdit && props.suggestedProperties.length > 0 && <PropertySuggestions />}
                </ListGroup>
            </div>
        );
    };

    const addLevel = (level, maxLevel) => {
        return maxLevel !== 0 ? (
            <StyledLevelBox>
                {maxLevel !== level + 1 && addLevel(level + 1, maxLevel)}
                {maxLevel === level + 1 && statements()}
            </StyledLevelBox>
        ) : (
            statements()
        );
    };

    const elements = addLevel(0, props.level);

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

            {props.level !== 0 ? (
                <>
                    <Breadcrumbs />
                </>
            ) : (
                ''
            )}
            <SBEditorHelpModal isOpen={helpModalOpen} toggle={() => setHelpModalOpen(v => !v)} />
            {elements}
        </>
    );
}

Statements.propTypes = {
    level: PropTypes.number.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    isFetchingStatements: PropTypes.bool.isRequired,
    selectedResource: PropTypes.string.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired,
    initializeWithoutContribution: PropTypes.func.isRequired,
    initializeWithResource: PropTypes.func.isRequired,
    updateSettings: PropTypes.func.isRequired,
    rootNodeType: PropTypes.string.isRequired,

    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    createProperty: PropTypes.func.isRequired,
    components: PropTypes.array.isRequired,
    canAddProperty: PropTypes.bool.isRequired,
    suggestedProperties: PropTypes.array.isRequired,

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
    rootNodeType: 'resource',
    level: 1
};
