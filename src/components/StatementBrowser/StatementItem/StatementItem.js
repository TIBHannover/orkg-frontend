import { forwardRef } from 'react';
import { toggleEditPropertyLabel } from 'slices/statementBrowserSlice';
import { faPen, faTrash, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItem';
import AddValue from 'components/StatementBrowser/AddValue/AddValue';
import StatementActionButton from 'components/StatementBrowser/StatementActionButton/StatementActionButton';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import defaultProperties from 'constants/defaultProperties';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES, PREDICATES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import useStatementItem from 'components/StatementBrowser/StatementItem/hooks/useStatementItem';
import SortableValueItem from 'components/StatementBrowser/StatementItem/SortableValueItem';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';

// eslint-disable-next-line react/display-name
const StatementItem = forwardRef((props, ref) => {
    const {
        propertiesAsLinks,
        propertyOptionsClasses,
        canDeleteProperty,
        dispatch,
        values,
        canAddValue,
        property,
        predicateLabel,
        handleChange,
        handleDeleteStatement,
    } = useStatementItem({
        propertyId: props.id,
        resourceId: props.resourceId,
        syncBackend: props.syncBackend,
    });

    const preferences = useSelector(state => state.statementBrowser.preferences);

    return (
        <StatementsGroupStyle ref={ref} className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'} list-group-item`}>
            <div className="row gx-0">
                <PropertyStyle className={`col-4 ${property.isEditing ? 'editingLabel' : ''}`} tabIndex="0">
                    {!property.isEditing ? (
                        <div>
                            <div className="propertyLabel">
                                {!property.isSaving && property.existingPredicateId && (
                                    <DescriptionTooltip
                                        id={property.existingPredicateId}
                                        _class={ENTITIES.PREDICATE}
                                        disabled={!preferences.showDescriptionTooltips}
                                    >
                                        <Link
                                            to={reverse(ROUTES.PROPERTY, { id: property.existingPredicateId })}
                                            target={!propertiesAsLinks ? '_blank' : '_self'}
                                            className={!propertiesAsLinks ? 'text-dark' : ''}
                                        >
                                            {predicateLabel}
                                        </Link>
                                    </DescriptionTooltip>
                                )}
                                {!property.isSaving && !property.existingPredicateId && predicateLabel}
                                {property.isSaving && 'Saving...'}
                            </div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    {!property.isSaving && (
                                        <StatementActionButton
                                            isDisabled={!canDeleteProperty || property.isDeleting}
                                            title={
                                                canDeleteProperty
                                                    ? 'Change property'
                                                    : "This property can not be changes because it's required by the template"
                                            }
                                            icon={faPen}
                                            action={() => dispatch(toggleEditPropertyLabel({ id: props.id }))}
                                            testId={`change-property-${property.existingPredicateId}`}
                                        />
                                    )}
                                    {property.isSaving && (
                                        <StatementActionButton
                                            isDisabled={true}
                                            title="Changing property"
                                            icon={faSpinner}
                                            iconSpin={true}
                                            action={() => null}
                                        />
                                    )}

                                    {!property.isDeleting && (
                                        <StatementActionButton
                                            isDisabled={!canDeleteProperty}
                                            title={
                                                canDeleteProperty
                                                    ? 'Delete property'
                                                    : "This property can not be deleted because it's required by the template"
                                            }
                                            icon={faTrash}
                                            requireConfirmation={true}
                                            confirmationMessage="Are you sure to delete?"
                                            confirmationButtons={[
                                                {
                                                    title: 'Delete',
                                                    color: 'danger',
                                                    icon: faCheck,
                                                    action: handleDeleteStatement,
                                                },
                                                {
                                                    title: 'Cancel',
                                                    color: 'secondary',
                                                    icon: faTimes,
                                                },
                                            ]}
                                            testId={`delete-property-${property.existingPredicateId}`}
                                        />
                                    )}
                                    {property.isDeleting && (
                                        <StatementActionButton
                                            isDisabled={true}
                                            title="Deleting property"
                                            icon={faSpinner}
                                            iconSpin={true}
                                            action={() => null}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <InputGroup size="sm">
                                <AutoComplete
                                    entityType={ENTITIES.PREDICATE}
                                    cssClasses="form-control-sm"
                                    placeholder={predicateLabel}
                                    onChange={(selectedOption, a) => {
                                        handleChange(selectedOption, a);
                                        dispatch(toggleEditPropertyLabel({ id: props.id }));
                                    }}
                                    onKeyDown={e => e.keyCode === 27 && e.target.blur()}
                                    disableBorderRadiusRight
                                    allowCreate
                                    defaultOptions={defaultProperties}
                                    onBlur={() => {
                                        dispatch(toggleEditPropertyLabel({ id: props.id }));
                                    }}
                                />
                            </InputGroup>
                        </div>
                    )}
                </PropertyStyle>
                <ValuesStyle className="col-8 valuesList">
                    <ListGroup flush className="px-3">
                        {property.valueIds.length > 0 &&
                            property.valueIds.map((valueId, index) => {
                                const value = values.byId[valueId];
                                return (
                                    <ConditionalWrapper
                                        key={valueId}
                                        condition={property.existingPredicateId === PREDICATES.HAS_LIST_ELEMENT}
                                        wrapper={children => (
                                            <SortableValueItem index={index} id={valueId} enableEdit={props.enableEdit} propertyId={props.id}>
                                                {children}
                                            </SortableValueItem>
                                        )}
                                    >
                                        <ValueItem
                                            value={value}
                                            id={valueId}
                                            enableEdit={props.enableEdit}
                                            syncBackend={props.syncBackend}
                                            propertyId={props.id}
                                            property={property}
                                            contextStyle="Template"
                                            index={index}
                                            valueIds={property.valueIds}
                                            showHelp={!!(props.showValueHelp && index === 0)}
                                            subjectId={props.resourceId}
                                            shouldDisableValueItemStyle={property.existingPredicateId === PREDICATES.HAS_LIST_ELEMENT}
                                        />
                                    </ConditionalWrapper>
                                );
                            })}
                        {!props.enableEdit && property.valueIds.length === 0 && (
                            <div className="pt-2">
                                <small>No values</small>
                            </div>
                        )}
                        {props.enableEdit && (
                            <AddValue isDisabled={!canAddValue} propertyId={props.id} resourceId={props.resourceId} syncBackend={props.syncBackend} />
                        )}
                    </ListGroup>
                </ValuesStyle>
            </div>
        </StatementsGroupStyle>
    );
});

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    resourceId: PropTypes.string,
    inTemplate: PropTypes.bool,
};

StatementItem.defaultProps = {
    resourceId: null,
    showValueHelp: false,
};

export default StatementItem;
