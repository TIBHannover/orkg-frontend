import React, { useState } from 'react';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ListGroup, Collapse, InputGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItemContainer';
import AddValue from 'components/StatementBrowser/AddValue/AddValueContainer';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import { StatementsGroupStyle, PropertyStyle, ValuesStyle } from 'components/AddPaper/Contributions/styled';
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
                            <div className={'propertyLabel'}>{props.predicateLabel}</div>
                            {props.enableEdit && (
                                <div className={propertyOptionsClasses}>
                                    <TemplateOptionButton
                                        title={'Edit property'}
                                        icon={faPen}
                                        action={() => props.toggleEditPropertyLabel({ id: props.id })}
                                    />
                                    <TemplateOptionButton
                                        requireConfirmation={true}
                                        confirmationMessage={'Are you sure to delete?'}
                                        title={'Delete property'}
                                        icon={faTrash}
                                        action={props.handleDeleteStatement}
                                        onVisibilityChange={() => setDisableHover(!disableHover)}
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
                                    label={value.label}
                                    id={valueId}
                                    type={value.type}
                                    classes={value.classes}
                                    enableEdit={props.enableEdit}
                                    syncBackend={props.syncBackend}
                                    resourceId={value.resourceId}
                                    propertyId={props.id}
                                    existingStatement={value.existingStatement}
                                    openExistingResourcesInDialog={props.openExistingResourcesInDialog}
                                    isExistingValue={value.isExistingValue}
                                    isEditing={value.isEditing}
                                    isSaving={value.isSaving}
                                    statementId={value.statementId}
                                    shared={value.shared}
                                    contextStyle="Template"
                                    showHelp={props.showValueHelp && index === 0 ? true : false}
                                />
                            );
                        })}
                        {props.enableEdit && <AddValue contextStyle="Template" propertyId={props.id} syncBackend={props.syncBackend} />}
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
    inTemplate: PropTypes.bool.isRequired,
    showValueHelp: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    handleDeleteStatement: PropTypes.func.isRequired,
    onVisibilityChange: PropTypes.func.isRequired
};
