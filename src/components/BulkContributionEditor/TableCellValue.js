import AutoComplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Input } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';

const TableCellValue = ({ value, index, setDisableCreate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value.label);
    const [isHovering, setIsHovering] = useState(false);

    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setIsHovering(false);
        setDisableCreate(false);
    };

    return !isEditing ? (
        <>
            {index > 0 && <ItemInnerSeparator className="my-0" />}
            <div className="position-relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
                <div onDoubleClick={handleStartEdit}>{value.label}</div>
                <TableCellButtons isHovering={isHovering} onEdit={handleStartEdit} onDelete={() => {}} backgroundColor="rgba(240, 242, 247, 0.8)" />
            </div>
        </>
    ) : (
        <div>
            {value.type === 'resource' && (
                <AutoComplete
                    requestUrl={resourcesUrl}
                    excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                    //optionsClass={props.valueClass ? props.valueClass.id : undefined}
                    menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                    placeholder="Enter a resource"
                    onItemSelected={i => {
                        //props.handleValueSelect(valueType, i);
                        //setShowAddValue(false);
                    }}
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
            {value.type === 'literal' && (
                <Input type="text" bsSize="sm" value={inputValue} autoFocus onChange={setInputValue} onBlur={handleStopEdit} />
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
