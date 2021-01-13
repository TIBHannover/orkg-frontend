import { useState } from 'react';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItemContainer';
import AddValue from 'components/StatementBrowser/AddValue/AddValueContainer';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import { predicatesUrl } from 'services/backend/predicates';
import defaultProperties from 'components/StatementBrowser/AddProperty/helpers/defaultProperties';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';

export default function StatementItemTemplate(props) {
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
                                    target={!props.propertiesAsLinks ? '_blank' : '_self'}
                                    className={!props.propertiesAsLinks ? 'text-dark' : ''}
                                >
                                    {props.predicateLabel}
                                </Link>
                            </div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    <StatementOptionButton
                                        isDisabled={!props.canDeleteProperty}
                                        title={
                                            props.canDeleteProperty
                                                ? 'Edit property'
                                                : "This property can not be changes because it's required by the template"
                                        }
                                        icon={faPen}
                                        action={() => props.toggleEditPropertyLabel({ id: props.id })}
                                    />
                                    <StatementOptionButton
                                        isDisabled={!props.canDeleteProperty}
                                        title={
                                            props.canDeleteProperty
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
                                    cssClasses="form-control-sm"
                                    requestUrl={predicatesUrl}
                                    placeholder={props.predicateLabel}
                                    onChange={(selectedOption, a) => {
                                        props.handleChange(selectedOption, a);
                                        props.toggleEditPropertyLabel({ id: props.id });
                                    }}
                                    onKeyDown={e => e.keyCode === 27 && e.target.blur()}
                                    disableBorderRadiusRight
                                    allowCreate
                                    defaultOptions={defaultProperties}
                                    onBlur={e => {
                                        props.toggleEditPropertyLabel({ id: props.id });
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
                                        components={props.components}
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
                                isDisabled={!props.canAddValue}
                                components={props.components}
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
    selectedProperty: PropTypes.string,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    inTemplate: PropTypes.bool,
    showValueHelp: PropTypes.bool,
    handleDeleteStatement: PropTypes.func.isRequired,
    propertiesAsLinks: PropTypes.bool.isRequired,
    components: PropTypes.array.isRequired,
    canAddValue: PropTypes.bool.isRequired,
    canDeleteProperty: PropTypes.bool.isRequired,
    resourceId: PropTypes.string
};
