import { deleteStatement, updateLiteral, updateResource } from 'actions/bulkContributionEditor';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import TableCellValueResource from 'components/BulkContributionEditor/TableCellValueResource';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Input } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';

const TableCellValue = ({ value, index, setDisableCreate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.label);
    const [isHovering, setIsHovering] = useState(false);
    const dispatch = useDispatch();

    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setIsHovering(false);
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

    return !isEditing ? (
        <>
            {index > 0 && <ItemInnerSeparator className="my-0" />}
            <div className="position-relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <ValuePlugins type={value._class} options={{ inModal: true }}>
                    {value._class === 'resource' && <TableCellValueResource value={value} />}
                    {value._class === 'literal' && <div onDoubleClick={handleStartEdit}>{value.label}</div>}
                </ValuePlugins>
                <TableCellButtons
                    isHovering={isHovering}
                    onEdit={handleStartEdit}
                    onDelete={handleDelete}
                    backgroundColor="rgba(240, 242, 247, 0.8)"
                />
            </div>
        </>
    ) : (
        <div>
            {value._class === 'resource' && (
                <Autocomplete
                    requestUrl={resourcesUrl}
                    excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                    menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                    placeholder="Enter a resource"
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
                <Input
                    type="text"
                    bsSize="sm"
                    value={inputValue}
                    autoFocus
                    onChange={e => setInputValue(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyPress={handleKeyPress}
                />
            )}
        </div>
    );
};

TableCellValue.propTypes = {
    value: PropTypes.object,
    index: PropTypes.number,
    setDisableCreate: PropTypes.func
};

export default memo(TableCellValue);
