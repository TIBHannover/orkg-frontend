import React, { useEffect } from 'react';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import Breadcrumbs from 'components/StatementBrowser/Breadcrumbs/BreadcrumbsContainer';
import ContributionTemplate from 'components/StatementBrowser/ContributionTemplate/ContributionTemplateContainer';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import NoData from 'components/StatementBrowser/NoData/NoData';
import { StyledLevelBox, StyledStatementItem } from 'components/StatementBrowser/styled';
import { Cookies } from 'react-cookie';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons';
import { uniq } from 'lodash';
import PropTypes from 'prop-types';

export default function Statements(props) {
    useEffect(() => {
        if (props.initialResourceId) {
            if (props.newStore) {
                props.initializeWithoutContribution({
                    resourceId: props.initialResourceId,
                    label: props.initialResourceLabel
                });
            } else {
                props.initializeWithResource({
                    resourceId: props.initialResourceId,
                    label: props.initialResourceLabel
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // run only once : https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects

    const canAddProperty = () => {
        const resource = props.resources.byId[props.selectedResource];
        // get template components
        // get all template ids
        let templateIds = resource.templateId ? [resource.templateId] : [];
        for (const c of resource.classes) {
            if (props.classes[c]) {
                templateIds = templateIds.concat(props.classes[c].templateIds);
            }
        }
        templateIds = uniq(templateIds);
        // get components of this statement predicate
        for (const templateId of templateIds) {
            const template = props.templates[templateId];
            if (template && template.isStrict) {
                return false;
            } else {
                return true;
            }
        }
        return true;
    };

    const getComponents = () => {
        const resource = props.resources.byId[props.selectedResource];
        // get template components
        // get all template ids
        let templateIds = resource.templateId ? [resource.templateId] : [];
        for (const c of resource.classes) {
            if (props.classes[c]) {
                templateIds = templateIds.concat(props.classes[c].templateIds);
            }
        }
        templateIds = uniq(templateIds);

        let components = [];
        // get components of this statement predicate
        for (const templateId of templateIds) {
            const template = props.templates[templateId];
            if (template && template.components) {
                components = components.concat(template.components);
            }
        }
        /*
        // add missing required properties (minOccurs >= 1)
        let propertyIds = props.resources.byId[props.selectedResource].propertyIds;
        propertyIds = propertyIds.map(propertyId => {
            const property = props.properties.byId[propertyId];
            return property.existingPredicateId;
        });
        components
            .filter(x => !propertyIds.includes(x.property.id))
            .map(mp => {
                if (mp.minOccurs >= 1) {
                    props.createProperty({
                        resourceId: props.selectedResource,
                        existingPredicateId: mp.property.id,
                        label: mp.property.label,
                        isTemplate: false,
                        createAndSelect: true
                    });
                }
            });
        */
        return components;
    };

    const suggestedProperties = () => {
        let propertyIds = props.resources.byId[props.selectedResource].propertyIds;
        propertyIds = propertyIds.map(propertyId => {
            const property = props.properties.byId[propertyId];
            return property.existingPredicateId;
        });
        return getComponents().filter(x => !propertyIds.includes(x.property.id));
    };

    const statements = () => {
        let propertyIds = [];
        let shared = 1;
        if (Object.keys(props.resources.byId).length !== 0 && props.selectedResource) {
            propertyIds = props.resources.byId[props.selectedResource].propertyIds;
            shared = props.resources.byId[props.selectedResource].shared;
        }
        // filter public properties
        propertyIds = propertyIds.filter(propertyId => {
            const property = props.properties.byId[propertyId];
            return property.existingPredicateId !== process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE;
        });

        return (
            <div>
                {props.selectedResource && props.resources.byId[props.selectedResource].classes.length > 0 && (
                    <div className="text-muted mb-2">Classes: {props.resources.byId[props.selectedResource].classes.join(',')}</div>
                )}
                <ListGroup className={'listGroupEnlarge'}>
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
                                            isLastItem={propertyIds.length === index + 1}
                                            openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                            showValueHelp={props.cookies && !props.cookies.get('showedValueHelp') && index === 0 ? true : false}
                                            resourceComponents={getComponents()}
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
                                                selectedResource={props.initialResourceId}
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

                    {shared <= 1 && props.enableEdit ? <AddProperty isDisabled={!canAddProperty()} syncBackend={props.syncBackend} /> : ''}
                    {shared <= 1 && props.enableEdit && suggestedProperties().length > 0 && (
                        <>
                            <p className="text-muted mt-4">Suggested properties</p>
                            <ListGroup>
                                {suggestedProperties().map((c, index) => (
                                    <ListGroupItem key={`suggested-property-${index}`}>
                                        <StatementOptionButton
                                            className="mr-2"
                                            title={'Add property'}
                                            icon={faPlus}
                                            action={() => {
                                                props.createProperty({
                                                    resourceId: props.selectedResource,
                                                    existingPredicateId: c.property.id,
                                                    label: c.property.label,
                                                    isTemplate: false,
                                                    createAndSelect: true
                                                });
                                            }}
                                        />
                                        {c.property.label}
                                        <Badge pill className="ml-2">
                                            {c.value.label}
                                        </Badge>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        </>
                    )}
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
                    <Breadcrumbs openExistingResourcesInDialog={props.openExistingResourcesInDialog} />
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

    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    createProperty: PropTypes.func.isRequired,

    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    newStore: PropTypes.bool,
    templatesFound: PropTypes.bool
};

Statements.defaultProps = {
    openExistingResourcesInDialog: false,
    initialResourceId: null,
    initialResourceLabel: null,
    syncBackend: false,
    newStore: false,
    templatesFound: false
};
