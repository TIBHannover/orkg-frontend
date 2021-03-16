import Autocomplete from 'components/Autocomplete/Autocomplete';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import Confirm from 'reactstrap-confirm';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProperty, updateProperty } from 'actions/contributionEditor';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { upperFirst } from 'lodash';
import { Button } from 'reactstrap';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';
import { PREDICATES, ENTITIES } from 'constants/graphSettings';

const TableHeaderRow = ({ property }) => {
    const [isOpenStatementBrowser, setIsOpenStatementBrowser] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(property.label);
    const statements = useSelector(state => state.contributionEditor.statements);
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
                    currently in the editor
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
        const confirmedProperty = action === 'create-option' ? await confirmProperty() : true;

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

    const isResearchProblem = property.id === PREDICATES.HAS_RESEARCH_PROBLEM;

    return !isEditing ? (
        <>
            <Properties className="columnProperty" onDoubleClick={handleStartEdit}>
                <PropertiesInner cellPadding={10}>
                    <div className="position-relative">
                        <Button onClick={() => setIsOpenStatementBrowser(true)} color="link" className="text-light m-0 p-0 text-left">
                            {upperFirst(property.label)}
                        </Button>
                        <TableCellButtons
                            onEdit={!isResearchProblem ? handleStartEdit : null}
                            onDelete={!isResearchProblem ? handleDelete : null}
                            backgroundColor="rgba(139, 145, 165, 0.8)"
                        />
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
                    entityType={ENTITIES.PREDICATE}
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
