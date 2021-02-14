import AutoComplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Input } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import { deleteStatement, updateLiteral, updateResource } from 'actions/bulkContributionEditor';
import { useDispatch, useSelector } from 'react-redux';

const TableCellValue = ({ value, index, setDisableCreate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.label);
    const [isHovering, setIsHovering] = useState(false);
    const statement = useSelector(state => state.bulkContributionEditor.statements[value.statementId]);

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

    const handleLiteralBlur = () => {
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

    const handleSelectResource = (resource, e) => {
        console.log(resource);
        const { contributionId, propertyId } = statement;
        dispatch(
            updateResource({
                statementId: value.statementId,
                contributionId,
                propertyId,
                newResource: resource
            })
        );
    };

    const handleDelete = () => {
        dispatch(deleteStatement(value.statementId));
    };

    /*
    const handleChange = (selected, { action }) => {
        if (action === 'select-option') {
            props.onItemSelected({
                id: selected.id,
                value: selected.label,
                shared: selected.shared,
                classes: selected.classes,
                external: selected.external ?? false,
                statements: selected.statements
            });
            setInputValue('');
        } else if (action === 'create-option') {
            props.onNewItemSelected && props.onNewItemSelected(selected.label);
        }
    };
    */
    return !isEditing ? (
        <>
            {index > 0 && <ItemInnerSeparator className="my-0" />}
            <div className="position-relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <div onDoubleClick={handleStartEdit}>{value.label}</div>
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
                <AutoComplete
                    requestUrl={resourcesUrl}
                    excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                    //optionsClass={props.valueClass ? props.valueClass.id : undefined}
                    menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                    placeholder="Enter a resource"
                    onItemSelected={handleSelectResource}
                    onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                    value={inputValue}
                    onBlur={handleStopEdit}
                    //additionalData={props.newResources}
                    //autoLoadOption={props.valueClass ? true : false}
                    openMenuOnFocus={true}
                    cssClasses="form-control-sm"
                    onKeyDown={e => {
                        /*if (e.keyCode === 27) {
                            // escape
                            setShowAddValue(false);
                        } else if (e.keyCode === 13 && !isMenuOpen()) {
                            props.handleAddValue(valueType, inputValue);
                            setShowAddValue(false);
                        }*/
                    }}
                    //innerRef={ref => (resourceInputRef.current = ref)}
                    //handleCreateExistingLabel={handleCreateExistingLabel}
                />
            )}
            {value._class === 'literal' && (
                <Input
                    type="text"
                    bsSize="sm"
                    value={inputValue}
                    autoFocus
                    onChange={e => setInputValue(e.target.value)}
                    onBlur={handleLiteralBlur}
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

export default TableCellValue;
