import Autocomplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/BulkContributionEditor/TableCellButtons';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { predicatesUrl } from 'services/backend/predicates';
import Confirm from 'reactstrap-confirm';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProperty, updateProperty } from 'actions/bulkContributionEditor';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { upperFirst } from 'lodash';
import { Button } from 'reactstrap';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';

const TableHeaderRow = ({ property }) => {
    const [isOpenStatementBrowser, setIsOpenStatementBrowser] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(property.label);
    const statements = useSelector(state => state.bulkContributionEditor.statements);
    const statementIds = Object.keys(statements).filter(statementId => statements[statementId].propertyId === property.id);
    const dispatch = useDispatch();
    const { confirmProperty } = useConfirmPropertyModal();

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleStopEdit = () => {
        setIsEditing(false);
    };

    const handleDelete = async () => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: (
                <span>
                    The property <strong>{property.label}</strong> and its corresponding values will be deleted for <strong>all contributions</strong>{' '}
                    currently in the bulk editor
                </span>
            ),
            cancelColor: 'light'
        });

        if (result) {
            dispatch(
                deleteProperty({
                    id: property.id,
                    statementIds
                })
            );
        }
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        const confirmedProperty = await confirmProperty();

        if ((action !== 'create-option' && action !== 'select-option') || !confirmedProperty) {
            return;
        }

        dispatch(
            updateProperty({
                id: property.id,
                statementIds,
                action,
                newId: selected.id ?? null,
                newLabel: inputValue
            })
        );
    };

    return !isEditing ? (
        <>
            <Properties className="columnProperty" onDoubleClick={handleStartEdit}>
                <PropertiesInner cellPadding={10}>
                    <div className="position-relative">
                        <Button onClick={() => setIsOpenStatementBrowser(true)} color="link" className="text-light m-0 p-0">
                            {upperFirst(property.label)}
                        </Button>
                        <TableCellButtons onEdit={handleStartEdit} onDelete={handleDelete} backgroundColor="rgba(139, 145, 165, 0.8)" />
                    </div>
                </PropertiesInner>
            </Properties>
            {isOpenStatementBrowser && (
                <StatementBrowserDialog
                    type="property"
                    toggleModal={() => setIsOpenStatementBrowser(v => !v)}
                    id={property.id}
                    label={property.label}
                    show
                    enableEdit
                    syncBackend
                />
            )}
        </>
    ) : (
        <Properties>
            <PropertiesInner cellPadding={10}>
                <Autocomplete
                    requestUrl={predicatesUrl}
                    placeholder="Enter a property"
                    onInput={(e, value) => setInputValue(e ? e.target.value : value)}
                    value={inputValue}
                    onBlur={handleStopEdit}
                    openMenuOnFocus={true}
                    cssClasses="form-control-sm"
                    onChange={handleChangeAutocomplete}
                    menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                    allowCreate
                />
            </PropertiesInner>
        </Properties>
    );
};

TableHeaderRow.propTypes = {
    property: PropTypes.object
};

export default memo(TableHeaderRow);
