import React from 'react';
import { ListGroup } from 'reactstrap';
import { canAddProperty as canAddPropertyAction, doneAnimation } from 'actions/statementBrowser';
import AddProperty from 'components/StatementBrowser/AddProperty/AddProperty';
import TemplateHeader from 'components/StatementBrowser/TemplateHeader/TemplateHeaderContainer';
import StatementItem from 'components/StatementBrowser/StatementItem/StatementItem';
import { AddPropertyWrapper, AnimationContainer } from './styled';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ContributionTemplate = props => {
    const dispatch = useDispatch();
    const statementBrowser = useSelector(state => state.statementBrowser);
    const { properties, resources } = statementBrowser;
    const canAddProperty = useSelector(state => canAddPropertyAction(state, props.value.resourceId));

    let propertyIds = [];
    let shared = 1;
    if (Object.keys(resources.byId).length !== 0 && props.value.resourceId) {
        propertyIds = resources.byId[props.value.resourceId].propertyIds;
        shared = resources.byId[props.value.resourceId].shared;
    }

    return (
        <AnimationContainer
            classNames="fadeIn"
            className="mt-3 pb-3"
            in={true}
            timeout={!props.isAnimated ? { enter: 700 } : { enter: 0 }}
            addEndListener={() => {
                if (!props.isAnimated) {
                    dispatch(doneAnimation({ id: props.propertyId }));
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
                    const property = properties.byId[propertyId];
                    return (
                        <StatementItem
                            key={'statement-' + index}
                            id={propertyId}
                            property={property}
                            predicateLabel={property.label}
                            enableEdit={shared <= 1 ? props.enableEdit : false}
                            syncBackend={props.syncBackend}
                            isLastItem={propertyIds.length === index + 1}
                            showValueHelp={false}
                            inTemplate={true}
                            contextStyle="Template"
                            resourceId={props.value.resourceId}
                        />
                    );
                })}
                <AddPropertyWrapper>
                    <div className="row no-gutters">
                        <div className="col-4 propertyHolder" />
                    </div>
                    <AddProperty
                        isDisabled={!canAddProperty}
                        syncBackend={props.syncBackend}
                        inTemplate={true}
                        contextStyle="Template"
                        resourceId={props.value.resourceId}
                    />
                </AddPropertyWrapper>
            </ListGroup>
        </AnimationContainer>
    );
};

ContributionTemplate.propTypes = {
    id: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
    selectedResource: PropTypes.string.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    isAnimated: PropTypes.bool
};

export default ContributionTemplate;
