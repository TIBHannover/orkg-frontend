import { useState } from 'react';
import {
    toggleEditPropertyLabel,
    getComponentsByResourceIDAndPredicateID,
    canAddValue as canAddValueAction,
    canDeleteProperty as canDeletePropertyAction
} from 'actions/statementBrowser';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItem';
import AddValue from 'components/StatementBrowser/AddValue/AddValue';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import defaultProperties from 'components/StatementBrowser/AddProperty/helpers/defaultProperties';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ROUTES from 'constants/routes.js';

export default function StatementItemTemplate(props) {
    const dispatch = useDispatch();
    const components = useSelector(state =>
        getComponentsByResourceIDAndPredicateID(
            state,
            props.resourceId ? props.resourceId : state.statementBrowser.selectedResource,
            props.property.existingPredicateId
        )
    );
    const canAddValue = useSelector(state =>
        canAddValueAction(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id)
    );
    const canDeleteProperty = useSelector(state =>
        canDeletePropertyAction(state, props.resourceId ? props.resourceId : state.statementBrowser.selectedResource, props.id)
    );
    const propertiesAsLinks = useSelector(state => state.statementBrowser.propertiesAsLinks);
    const [disableHover, setDisableHover] = useState(false);

    const propertyOptionsClasses = classNames({
        propertyOptions: true,
        disableHover: disableHover
    });
    return (
        <StatementsGroupStyle className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'}`}>
            <div className="row no-gutters">
                <PropertyStyle className={`col-4 ${props.property.isEditing ? 'editingLabel' : ''}`} tabIndex="0">
                    {!props.property.isEditing ? (
                        <div>
                            <div className="propertyLabel">
                                <Link
                                    to={reverse(ROUTES.PREDICATE, { id: props.property.existingPredicateId })}
                                    target={!propertiesAsLinks ? '_blank' : '_self'}
                                    className={!propertiesAsLinks ? 'text-dark' : ''}
                                >
                                    {props.predicateLabel}
                                </Link>
                            </div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    <StatementOptionButton
                                        isDisabled={!canDeleteProperty}
                                        title={
                                            canDeleteProperty
                                                ? 'Edit property'
                                                : "This property can not be changes because it's required by the template"
                                        }
                                        icon={faPen}
                                        action={() => dispatch(toggleEditPropertyLabel({ id: props.id }))}
                                    />
                                    <StatementOptionButton
                                        isDisabled={!canDeleteProperty}
                                        title={
                                            canDeleteProperty
                                                ? 'Delete property'
                                                : "This property can not be deleted because it's required by the template"
                                        }
                                        requireConfirmation={true}
                                        confirmationMessage="Are you sure to delete?"
                                        icon={faTrash}
                                        action={props.handleDeleteStatement}
                                        onVisibilityChange={disable => setDisableHover(disable)}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <InputGroup size="sm">
                                <AutoComplete
                                    entityType={ENTITIES.PREDICATE}
                                    cssClasses="form-control-sm"
                                    placeholder={props.predicateLabel}
                                    onChange={(selectedOption, a) => {
                                        props.handleChange(selectedOption, a);
                                        dispatch(toggleEditPropertyLabel({ id: props.id }));
                                    }}
                                    onKeyDown={e => e.keyCode === 27 && e.target.blur()}
                                    disableBorderRadiusRight
                                    allowCreate
                                    defaultOptions={defaultProperties}
                                    onBlur={e => {
                                        dispatch(toggleEditPropertyLabel({ id: props.id }));
                                    }}
                                />
                            </InputGroup>
                        </div>
                    )}
                </PropertyStyle>
                <ValuesStyle className="col-8 valuesList">
                    <ListGroup flush className="px-3">
                        {props.property.valueIds.length > 0 &&
                            props.property.valueIds.map((valueId, index) => {
                                const value = props.values.byId[valueId];
                                return (
                                    <ValueItem
                                        value={value}
                                        key={index}
                                        id={valueId}
                                        enableEdit={props.enableEdit}
                                        syncBackend={props.syncBackend}
                                        propertyId={props.id}
                                        contextStyle="Template"
                                        showHelp={props.showValueHelp && index === 0 ? true : false}
                                        components={components}
                                    />
                                );
                            })}
                        {!props.enableEdit && props.property.valueIds.length === 0 && (
                            <div className="pt-2">
                                <small>No values</small>
                            </div>
                        )}
                        {props.enableEdit && (
                            <AddValue
                                isDisabled={!canAddValue}
                                components={components}
                                contextStyle="Template"
                                propertyId={props.id}
                                resourceId={props.resourceId}
                                syncBackend={props.syncBackend}
                            />
                        )}
                    </ListGroup>
                </ValuesStyle>
            </div>
        </StatementsGroupStyle>
    );
}

StatementItemTemplate.propTypes = {
    property: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    inTemplate: PropTypes.bool,
    showValueHelp: PropTypes.bool,
    handleDeleteStatement: PropTypes.func.isRequired,
    resourceId: PropTypes.string
};
