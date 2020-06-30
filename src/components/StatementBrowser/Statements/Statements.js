import React, { useEffect } from 'react';
import { ListGroup } from 'reactstrap';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/BreadcrumbsContainer';
import ContributionTemplate from 'components/StatementBrowser/ContributionTemplate/ContributionTemplateContainer';
import PropertySuggestions from 'components/StatementBrowser/PropertySuggestions/PropertySuggestions';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { Cookies } from 'react-cookie';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default function Statements(props) {
    useEffect(() => {
        if (props.initialResourceId) {
            if (props.newStore) {
                props.initializeWithoutContribution({
                    resourceId: props.initialResourceId,
                    label: props.initialResourceLabel,
                    rootNodeType: props.rootNodeType
                });
            } else {
                props.initializeWithResource({
                    resourceId: props.initialResourceId,
                    label: props.initialResourceLabel
                });
            }
            props.updateSettings({
                openExistingResourcesInDialog: props.openExistingResourcesInDialog,
                propertiesAsLinks: props.propertiesAsLinks,
                resourcesAsLinks: props.resourcesAsLinks
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only once : https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects

    const statements = () => {
        let propertyIds = [];
        let shared = 1;
        if (Object.keys(props.resources.byId).length !== 0 && props.selectedResource) {
            propertyIds = props.resources.byId[props.selectedResource].propertyIds;
            shared = props.resources.byId[props.selectedResource].shared;
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
                                            key={'statement-' + index}
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
                                    return property.valueIds.map((valueId, index) => {
                                        const value = props.values.byId[valueId];
                                        return (
                                            <ContributionTemplate
                                                key={`template-${index}-${valueId}`}
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
            {props.level !== 0 ? (
                <>
                    <Breadcrumbs />
                </>
            ) : (
                ''
            )}

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
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    newStore: PropTypes.bool,
    templatesFound: PropTypes.bool,
    propertiesAsLinks: PropTypes.bool,
    resourcesAsLinks: PropTypes.bool
};

Statements.defaultProps = {
    openExistingResourcesInDialog: false,
    initialResourceId: null,
    initialResourceLabel: null,
    syncBackend: false,
    newStore: false,
    templatesFound: false,
    propertiesAsLinks: false,
    resourcesAsLinks: false,
    rootNodeType: 'resource',
    level: 1
};
