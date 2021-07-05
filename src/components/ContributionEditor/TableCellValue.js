import { deleteStatement, updateLiteral, updateResource } from 'actions/contributionEditor';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import TableCellValueResource from 'components/ContributionEditor/TableCellValueResource';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { CLASSES, ENTITIES, PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { forwardRef, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import styled from 'styled-components';

const Value = styled.div`
    &:hover .cell-buttons {
        display: block;
    }
`;

const TableCellValue = forwardRef(({ value, index, setDisableCreate, propertyId }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.label);
    const dispatch = useDispatch();

    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setDisableCreate(false);
    };

    const handleUpdate = () => {
        handleStopEdit();

        // check if input is dirty
        if (value.label !== inputValue) {
            dispatch(
                updateLiteral({
                    id: value.id,
                    label: inputValue
                })
            );
        }
    };

    const handleDelete = () => {
        dispatch(deleteStatement(value.statementId));
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action !== 'create-option' && action !== 'select-option') {
            return;
        }
        handleStopEdit();

        dispatch(
            updateResource({
                statementId: value.statementId,
                resourceId: selected.id ?? null,
                resourceLabel: inputValue,
                action
            })
        );
    };

    const handleKeyPress = e => {
        if (e.key === 'Enter') {
            handleUpdate();
        }
    };

    return (
        <div ref={ref}>
            {!isEditing ? (
                <>
                    {index > 0 && <ItemInnerSeparator className="my-0" />}
                    <Value className="position-relative">
                        <ValuePlugins type={value._class} options={{ inModal: true }}>
                            {value._class === 'resource' && <TableCellValueResource value={value} />}
                            {value._class === 'literal' && (
                                <div role="textbox" tabIndex="0" onDoubleClick={handleStartEdit}>
                                    {value.label || <i>No label</i>}
                                </div>
                            )}
                        </ValuePlugins>
                        <TableCellButtons onEdit={handleStartEdit} onDelete={handleDelete} backgroundColor="rgba(240, 242, 247, 0.8)" />
                    </Value>
                </>
            ) : (
                <div>
                    {value._class === 'resource' && (
                        <Autocomplete
                            optionsClass={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? CLASSES.PROBLEM : undefined}
                            entityType={ENTITIES.RESOURCE}
                            excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.TEMPLATE}`}
                            menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                            placeholder={propertyId === PREDICATES.HAS_RESEARCH_PROBLEM ? 'Enter a research problem' : 'Enter a resource'}
                            onChange={handleChangeAutocomplete}
                            onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                            value={inputValue}
                            onBlur={handleStopEdit}
                            openMenuOnFocus={true}
                            cssClasses="form-control-sm"
                            allowCreate
                        />
                    )}
                    {value._class === 'literal' && (
                        <Textarea
                            value={inputValue}
                            autoFocus
                            onChange={e => setInputValue(e.target.value)}
                            onBlur={handleUpdate}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter a literal"
                            className="form-control text-center"
                            style={{ margin: '-7px 0' }}
                        />
                    )}
                </div>
            )}
        </div>
    );
});

TableCellValue.propTypes = {
    value: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    setDisableCreate: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired
};

export default memo(TableCellValue);
