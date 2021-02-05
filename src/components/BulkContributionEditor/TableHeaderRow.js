import Autocomplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { predicatesUrl } from 'services/backend/predicates';

const TableHeaderRow = ({ property }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(property.label);

    const handleStartEdit = () => {
        setIsEditing(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setIsHovering(false);
    };

    return !isEditing ? (
        <Properties
            className="columnProperty"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onDoubleClick={handleStartEdit}
        >
            <PropertiesInner cellPadding={10}>
                <div className="position-relative">
                    {property.label}
                    <TableCellButtons
                        isHovering={isHovering}
                        onEdit={handleStartEdit}
                        onDelete={() => {}}
                        backgroundColor="rgba(139, 145, 165, 0.8)"
                    />
                </div>
            </PropertiesInner>
        </Properties>
    ) : (
        <Properties>
            <PropertiesInner cellPadding={10}>
                <Autocomplete
                    requestUrl={predicatesUrl}
                    placeholder="Enter a property"
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
                    menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
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
            </PropertiesInner>
        </Properties>
    );
};

TableHeaderRow.propTypes = {
    property: PropTypes.object
};

export default TableHeaderRow;
