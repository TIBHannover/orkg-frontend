import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useState } from 'react';

import { TData, useGridDispatch, useGridState } from '@/app/grid-editor/context/GridContext';
import useSwrStatementsCache from '@/app/grid-editor/hooks/useSwrStatementsCache';
import ActionButton from '@/components/ActionButton/ActionButton';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ROUTES from '@/constants/routes';
import { deleteStatementById } from '@/services/backend/statements';
import { Predicate } from '@/services/backend/types';

type PropertyCellProps = {
    value: Predicate;
    data?: TData;
};

const PropertyCell = ({ value, data }: PropertyCellProps) => {
    const { newProperties } = useGridState();
    const dispatch = useGridDispatch();
    const [disableHover, setDisableHover] = useState(false);
    const { deleteStatements } = useSwrStatementsCache();
    const onDeleteRow = async () => {
        if (!data || !data.statements || !value) return;

        try {
            // Get all statements in this row that are not null
            const statementsToDelete = Object.values(data.statements).filter((statement) => statement && statement.id);
            // Delete all statements in this row from the backend
            await Promise.all(statementsToDelete.map((statement) => deleteStatementById(statement!.id)));
            await deleteStatements(statementsToDelete.map((statement) => statement!.id));
            dispatch({ type: 'DELETE_ROW', payload: { rowId: data.id } });
            // If this is a new property (not yet saved), remove it from the context
            const isNewProperty = newProperties.some((p) => p.id === value.id);
            if (isNewProperty) {
                dispatch({ type: 'DELETE_PROPERTY', payload: { predicateId: value.id } });
            }
        } catch (error) {
            console.error('Error deleting row:', error);
        }
    };

    if (!value) {
        return <div>Loading...</div>;
    }

    return (
        <div className="tw:flex tw:items-center tw:justify-between tw:group tw:w-full tw:relative">
            <Link
                href={reverse(ROUTES.PROPERTY, { id: value.id })}
                target="_blank"
                className="tw:!text-black tw:hover:!text-decoration-none tw:no-underline"
            >
                <DescriptionTooltip id={value.id} _class={value._class}>
                    <strong className="tw:line-clamp-3">{value.label}</strong>
                </DescriptionTooltip>
            </Link>
            <div className="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:duration-200">
                <ActionButton
                    title="Delete entire row"
                    icon={faTrash}
                    isDisabled={false}
                    requireConfirmation
                    confirmationMessage="Are you sure you want to delete this entire row? This will delete all statements for this property."
                    confirmationButtons={[
                        {
                            title: 'Delete Row',
                            color: 'danger',
                            icon: faCheck,
                            action: onDeleteRow,
                        },
                        {
                            title: 'Cancel',
                            color: 'secondary',
                            icon: faTimes,
                        },
                    ]}
                    open={disableHover}
                    setOpen={setDisableHover}
                />
            </div>
        </div>
    );
};

export default PropertyCell;
