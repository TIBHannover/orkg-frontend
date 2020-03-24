import React from 'react';
import { ListGroup, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { StyledStatementItem, StyledListGroupOpen } from 'components/StatementBrowser/styled';
import ValueItem from 'components/StatementBrowser/ValueItem/ValueItemContainer';
import AddValue from 'components/StatementBrowser/AddValue/AddValueContainer';
import StatementOptions from 'components/StatementBrowser/StatementOptions';
import AsyncCreatableSelect from 'react-select/async-creatable';
import classNames from 'classnames';
import { customStyles } from './style';
import PropTypes from 'prop-types';

export default function StatementItemSB(props) {
    const isCollapsed = props.selectedProperty === props.id;

    const listGroupClass = classNames({
        statementActive: isCollapsed,
        statementItem: true,
        selectable: true,
        'd-flex': true,
        'rounded-bottom': props.isLastItem && !isCollapsed && !props.enableEdit
    });

    const chevronClass = classNames({
        statementItemIcon: true,
        open: isCollapsed,
        'float-right': true
    });

    const openBoxClass = classNames({
        listGroupOpenBorderBottom: props.isLastItem,
        'rounded-bottom': !props.enableEdit
    });

    return (
        <>
            <StyledStatementItem
                active={isCollapsed}
                onClick={() => (!props.property.isEditing ? props.togglePropertyCollapse(props.id) : undefined)}
                className={listGroupClass}
            >
                <div className="flex-grow-1 mr-4">
                    {!props.property.isSaving ? (
                        !props.property.isEditing ? (
                            props.predicateLabel
                        ) : (
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
                        )
                    ) : (
                        'Saving ...'
                    )}

                    {props.property.valueIds.length === 1 && !isCollapsed ? (
                        <>
                            :{' '}
                            <em className="text-muted">
                                <ValueItem
                                    value={props.values.byId[props.property.valueIds[0]]}
                                    id={props.property.valueIds[0]}
                                    propertyId={props.id}
                                    inline
                                    enableEdit={false}
                                    syncBackend={false}
                                    shared={1}
                                />
                            </em>
                        </>
                    ) : props.property.valueIds.length > 1 && !isCollapsed ? (
                        <>
                            : <em className="text-muted">{props.property.valueIds.length} values</em>
                        </>
                    ) : (
                        ''
                    )}
                </div>

                {props.enableEdit ? <StatementOptions id={props.id} syncBackend={props.syncBackend} isEditing={props.property.isEditing} /> : ''}

                <Icon icon={isCollapsed ? faChevronCircleUp : faChevronCircleDown} className={chevronClass} />
            </StyledStatementItem>

            <Collapse isOpen={isCollapsed}>
                <StyledListGroupOpen className={openBoxClass}>
                    <ListGroup flush>
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
                                    showHelp={props.showValueHelp && index === 0 ? true : false}
                                />
                            );
                        })}

                        {props.enableEdit ? <AddValue propertyId={props.id} syncBackend={props.syncBackend} /> : ''}
                    </ListGroup>
                </StyledListGroupOpen>
            </Collapse>
        </>
    );
}

StatementItemSB.propTypes = {
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
    showValueHelp: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool.isRequired
};
