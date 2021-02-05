import AutoComplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import InputField from 'components/StatementBrowser/InputField/InputField';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useState } from 'react';
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
            <div
                className="position-relative"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{ padding: '10px 0' }}
            >
                <div onDoubleClick={handleStartEdit}>{value.label}</div>
                <TableCellButtons isHovering={isHovering} onEdit={handleStartEdit} onDelete={() => {}} backgroundColor="rgba(240, 242, 247, 0.8)" />
            </div>
        </>
    ) : (
        <div style={{ minHeight: 38, paddingTop: 4 }}>
            {value.type === 'resource' && (
                <div style={{ position: 'absolute', width: 215, zIndex: 3 }}>
                    <AutoComplete
                        requestUrl={resourcesUrl}
                        excludeClasses={`${CLASSES.CONTRIBUTION},${CLASSES.PROBLEM},${CLASSES.CONTRIBUTION_TEMPLATE}`}
                        //optionsClass={props.valueClass ? props.valueClass.id : undefined}
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
                </div>
            )}
            {value.type === 'literal' && (
                <InputField
                    components={[]}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                    onBlur={handleStopEdit}
                    isValid={true}
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
