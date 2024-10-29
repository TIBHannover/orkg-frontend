import Autocomplete from 'components/Autocomplete/Autocomplete';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import Confirm from 'components/Confirmation/Confirmation';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import DataBrowserDialog from 'components/DataBrowser/DataBrowserDialog';
import ConfirmCreatePropertyModal from 'components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import { env } from 'next-runtime-env';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { canDeletePropertyAction, deleteProperty, updateProperty } from 'slices/contributionEditorSlice';

const TableHeaderRow = ({ property }) => {
    const [isOpenStatementBrowser, setIsOpenStatementBrowser] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(property.label);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const statements = useSelector((state) => state.contributionEditor.statements);
    const statementIds = Object.keys(statements).filter((statementId) => statements[statementId].propertyId === property.id);
    const pwcStatementIds = Object.keys(statements).filter(
        (statementId) => statements[statementId].propertyId === property.id && statements[statementId].created_by === env('NEXT_PUBLIC_PWC_USER_ID'),
    );

    const canDeleteProperty = useSelector((state) => canDeletePropertyAction(state, property.id));

    const dispatch = useDispatch();

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
        });

        if (result) {
            dispatch(
                deleteProperty({
                    id: property.id,
                    statementIds,
                }),
            );
        }
    };

    const handleCreate = ({ id }) => {
        dispatch(
            updateProperty({
                id: property.id,
                statementIds,
                action: 'select-option',
                newId: id,
                newLabel: inputValue,
            }),
        );
        setIsOpenConfirmModal(false);
    };

    const handleChangeAutocomplete = async (selected, { action }) => {
        if (action === 'create-option') {
            setInputValue(selected.label);
            setIsOpenConfirmModal(true);
        } else {
            handleCreate({ id: selected.id });
        }
    };

    return (
        <>
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={inputValue}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
                    shouldPerformCreate
                />
            )}
            {!isEditing ? (
                <>
                    <Properties className="columnProperty" onDoubleClick={handleStartEdit}>
                        <PropertiesInner cellPadding={10}>
                            <div className="position-relative">
                                <Button
                                    onClick={() => setIsOpenStatementBrowser(true)}
                                    color="link"
                                    className="text-light m-0 p-0 text-start user-select-auto"
                                >
                                    {property.label}
                                </Button>
                                {pwcStatementIds.length === 0 && (
                                    <TableCellButtons
                                        onEdit={canDeleteProperty ? handleStartEdit : null}
                                        onDelete={canDeleteProperty ? handleDelete : null}
                                        backgroundColor="rgba(139, 145, 165, 0.8)"
                                    />
                                )}
                            </div>
                        </PropertiesInner>
                    </Properties>
                    {isOpenStatementBrowser && (
                        <DataBrowserDialog
                            isEditMode
                            toggleModal={() => setIsOpenStatementBrowser((v) => !v)}
                            id={property.id}
                            label={property.label}
                            type={ENTITIES.PREDICATE}
                            show
                        />
                    )}
                </>
            ) : (
                <Properties>
                    <PropertiesInner cellPadding={10}>
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder="Enter a property"
                            onChange={handleChangeAutocomplete}
                            onInputChange={(newValue, actionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                            value={property}
                            onBlur={handleStopEdit}
                            openMenuOnFocus
                            autoFocus
                            size="sm"
                            menuPortalTarget={document.body} // use a portal to ensure the menu isn't blocked by other elements
                            allowCreate
                        />
                    </PropertiesInner>
                </Properties>
            )}
        </>
    );
};

TableHeaderRow.propTypes = {
    property: PropTypes.object,
};

export default memo(TableHeaderRow);
