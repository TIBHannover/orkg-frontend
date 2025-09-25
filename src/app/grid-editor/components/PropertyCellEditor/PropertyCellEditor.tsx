import { faClose, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColDef, RowNode } from 'ag-grid-community';
import React, { FC, useState } from 'react';

import { TData } from '@/app/grid-editor/context/GridContext';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import SmartPropertyGuidelinesCheck from '@/components/SmartSuggestions/SmartPropertyGuidelinesCheck';
import Button from '@/components/Ui/Button/Button';
import InputGroup from '@/components/Ui/Input/InputGroup';
import { ENTITIES } from '@/constants/graphSettings';
import { updateStatements } from '@/services/backend/statements';
import { Predicate } from '@/services/backend/types';

export const ROW_HEIGHT = 72;

// Define the interface for the reactive cell editor
type PropertyCellEditorProps = {
    initialValue: Predicate | null;
    value: Predicate;
    onValueChange: (value: Predicate | null) => void;
    stopEditing: () => void;
    colDef: ColDef;
    node: RowNode;
    data: TData;
};

const PropertyCellEditor: FC<PropertyCellEditorProps> = ({ initialValue, value: predicate, onValueChange, stopEditing, node, colDef, data }) => {
    const { updateStatementsPredicate } = useSwrStatementsCache();
    const [inputValue, setInputValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Handle successful value submission
    const handleSuccess = async (p: Predicate) => {
        setIsLoading(true);
        try {
            // Fetch the updated statement
            if (data.statements) {
                const statementIds = Object.values(data.statements)
                    .map((statement) => statement?.id)
                    .filter((id) => id !== undefined);

                await updateStatements(statementIds, { predicate_id: p.id });
                updateStatementsPredicate(statementIds, p);
                // Call onValueChange to update the grid
                onValueChange(p);
            }
        } catch (error) {
            console.error('Error fetching updated statement:', error);
        } finally {
            setIsLoading(false);
            stopEditing();
        }
    };

    // Handle key events
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSuccess(predicate);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            // Revert to initial value and stop editing
            onValueChange(initialValue);
            stopEditing();
        }
    };

    return (
        <div
            className="custom-cell-editor tw:bg-white tw:w-[500px] tw:min-w-[500px] tw:h-full tw:flex tw:flex-col tw:p-1 tw:gap-1 tw:relative tw:z-[100]"
            style={{ minHeight: ROW_HEIGHT }}
            onKeyDown={handleKeyDown}
            role="textbox"
            tabIndex={0}
        >
            {isLoading && (
                <div className="tw:flex tw:items-center tw:justify-center tw:h-full tw:w-full">
                    <FontAwesomeIcon icon={faSpinner} spin />
                </div>
            )}
            {!isLoading && (
                <div className="tw:flex tw:items-center tw:w-full">
                    <InputGroup size="sm" className="tw:flex-grow-1 tw:flex-nowrap">
                        <Autocomplete
                            entityType={ENTITIES.PREDICATE}
                            size="sm"
                            placeholder="Select or type to enter a property"
                            onChange={(value, { action }) => {
                                if (action === 'select-option' && value) {
                                    handleSuccess(value as Predicate);
                                } else if (action === 'create-option' && value) {
                                    setInputValue(value.label);
                                    setIsModalOpen(true);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.code === 'Escape') {
                                    stopEditing();
                                }
                            }}
                            value={predicate as OptionType}
                            allowCreate
                            autoFocus
                            onInputChange={(newValue, actionMeta) => {
                                if (actionMeta.action !== 'menu-close' && actionMeta.action !== 'input-blur') {
                                    setInputValue(newValue);
                                }
                            }}
                            className="tw:flex-1 tw:min-w-0"
                            menuPortalTarget={document.body}
                        />
                        <SmartPropertyGuidelinesCheck label={inputValue} />
                        <Button
                            size="sm"
                            type="submit"
                            color="secondary"
                            className="tw:px-2"
                            onClick={() => {
                                stopEditing();
                            }}
                            title="Cancel"
                        >
                            <FontAwesomeIcon icon={faClose} />
                        </Button>
                    </InputGroup>
                    {isModalOpen && (
                        <ConfirmCreatePropertyModal
                            label={inputValue}
                            onCreate={(value) => handleSuccess(value as Predicate)}
                            isOpen={isModalOpen}
                            toggle={() => setIsModalOpen((v) => !v)}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

PropertyCellEditor.displayName = 'PropertyCellEditor';

export default PropertyCellEditor;
