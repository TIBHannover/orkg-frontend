import React, { useState } from 'react';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItemContainer';
import AddValue from 'components/StatementBrowser/AddValue/AddValueContainer';
import StatementOptionButton from 'components/StatementBrowser/StatementOptionButton/StatementOptionButton';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import { customStyles } from './style';
import AsyncCreatableSelect from 'react-select/async-creatable';

export default function StatementItemTemplate(props) {
    const [disableHover, setDisableHover] = useState(false);

    const propertyOptionsClasses = classNames({
        propertyOptions: true,
        disableHover: disableHover
    });

    return (
        <StatementsGroupStyle className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'}`}>
            <div className={'row no-gutters'}>
                <PropertyStyle className={`col-4 ${props.property.isEditing ? 'editingLabel' : ''}`} tabIndex="0">
                    {!props.property.isEditing ? (
                        <div>
                            <div className={'propertyLabel'}>
                                {props.predicateLabel} {}
                                {props.enableEdit && props.typeComponents && props.typeComponents.length > 0 && (
                                    <small>[{props.typeComponents.map(c => c.value.label).join(',')}]</small>
                                )}
                            </div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    <StatementOptionButton
                                        title={'Edit property'}
                                        icon={faPen}
                                        action={() => props.toggleEditPropertyLabel({ id: props.id })}
                                    />
                                    <StatementOptionButton
                                        requireConfirmation={true}
                                        confirmationMessage={'Are you sure to delete?'}
                                        title={'Delete property'}
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
                                <AsyncCreatableSelect
                                    className="form-control"
                                    loadOptions={props.loadOptions}
                                    styles={customStyles}
                                    autoFocus
                                    getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                    getOptionValue={({ id }) => id}
                                    defaultOptions={[
                                        {
                                            label: props.predicateLabel,
                                            id: props.property.existingPredicateId
                                        }
                                    ]}
                                    placeholder={props.predicateLabel}
                                    cacheOptions
                                    onChange={(selectedOption, a) => {
                                        props.handleChange(selectedOption, a);
                                        props.toggleEditPropertyLabel({ id: props.id });
                                    }}
                                    onBlur={e => {
                                        props.toggleEditPropertyLabel({ id: props.id });
                                    }}
                                    onKeyDown={e => e.keyCode === 27 && e.target.blur()}
                                />
                            </InputGroup>
                        </div>
                    )}
                </PropertyStyle>
                <ValuesStyle className={'col-8 valuesList'}>
                    <ListGroup flush className="px-3">
                        {props.property.valueIds.map((valueId, index) => {
                            const value = props.values.byId[valueId];
                            return (
                                <ValueItem
                                    value={value}
                                    key={index}
                                    id={valueId}
                                    enableEdit={props.enableEdit}
                                    syncBackend={props.syncBackend}
                                    propertyId={props.id}
                                    openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                    contextStyle="Template"
                                    showHelp={props.showValueHelp && index === 0 ? true : false}
                                    typeComponents={props.typeComponents}
                                />
                            );
                        })}
                        {props.enableEdit && (
                            <AddValue
                                typeComponents={props.typeComponents}
                                contextStyle="Template"
                                propertyId={props.id}
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
    togglePropertyCollapse: PropTypes.func.isRequired,
    property: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string,
    isLastItem: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    values: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    inTemplate: PropTypes.bool,
    showValueHelp: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    handleDeleteStatement: PropTypes.func.isRequired,
    typeComponents: PropTypes.array.isRequired
};
