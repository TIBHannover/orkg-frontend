import React from 'react';
import { ListGroup } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty/AddPropertyContainer';
import TemplateHeader from 'components/StatementBrowser/TemplateHeader/TemplateHeaderContainer';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItemContainer';
import { AddPropertWrapper, AnimationContainer } from './styled';
import { Cookies } from 'react-cookie';
import { uniq } from 'lodash';
import PropTypes from 'prop-types';

export default function ContributionTemplate(props) {
    let propertyIds = [];
    let shared = 1;
    if (Object.keys(props.resources.byId).length !== 0 && props.value.resourceId) {
        propertyIds = props.resources.byId[props.value.resourceId].propertyIds;
        shared = props.resources.byId[props.value.resourceId].shared;
    }
    // filter public properties
    propertyIds = propertyIds.filter(propertyId => {
        const property = props.properties.byId[propertyId];
        return property.existingPredicateId !== process.env.REACT_APP_PREDICATES_INSTANCE_OF_TEMPLATE;
    });

    const canAddProperty = () => {
        const resource = props.resources.byId[props.value.resourceId];
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

    return (
        <AnimationContainer
            classNames="fadeIn"
            className="mt-3 pb-3"
            in={true}
            timeout={!props.isAnimated ? { enter: 700 } : { enter: 0 }}
            addEndListener={(node, done) => {
                if (!props.isAnimated) {
                    props.doneAnimation({ id: props.propertyId });
                }
            }}
            appear
        >
            <ListGroup>
                <TemplateHeader
                    syncBackend={props.syncBackend}
                    value={props.value}
                    id={props.id}
                    propertyId={props.propertyId}
                    resourceId={props.selectedResource}
                />
                {propertyIds.map((propertyId, index) => {
                    const property = props.properties.byId[propertyId];
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
                            inTemplate={true}
                            contextStyle={'Template'}
                            resourceId={props.value.resourceId}
                            resourceComponents={props.components}
                        />
                    );
                })}
                <AddPropertWrapper>
                    <div className={'row no-gutters'}>
                        <div className={'col-4 propertyHolder'} />
                    </div>
                    <AddProperty
                        isDisabled={!canAddProperty()}
                        syncBackend={props.syncBackend}
                        inTemplate={true}
                        contextStyle="Template"
                        resourceId={props.value.resourceId}
                    />
                </AddPropertWrapper>
            </ListGroup>
        </AnimationContainer>
    );
}

ContributionTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    selectedResource: PropTypes.string.isRequired,
    inTemplate: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    isAnimated: PropTypes.bool,

    classes: PropTypes.object.isRequired,
    templates: PropTypes.object.isRequired,
    components: PropTypes.array.isRequired,

    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    doneAnimation: PropTypes.func.isRequired,
    cookies: PropTypes.instanceOf(Cookies).isRequired
};

ContributionTemplate.defaultProps = {
    inTemplate: false,
    label: 'Type',
    properties: []
};
