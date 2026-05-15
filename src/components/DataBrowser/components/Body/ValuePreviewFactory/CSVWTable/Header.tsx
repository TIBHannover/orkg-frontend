import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, TextField } from '@heroui/react';
import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { ColType } from '@/components/DataBrowser/types/DataBrowserTypes';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import { deleteTableColumn, tablesUrl } from '@/services/backend/tables';

const Header = ({
    column,
    index,
    tableID,
    handleUpdateTableHeader,
}: {
    column: ColType;
    index: number;
    tableID: string;
    handleUpdateTableHeader: (index: number, value: string) => void;
}) => {
    const { mutate } = useSWRConfig();

    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { isUsingSnapshot } = useSnapshotStatement();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isDeletingColumn, setIsDeletingColumn] = useState<boolean>(false);

    const [value, setValue] = useState<string>(column.label ?? '');

    const onSaveValue = async () => {
        await handleUpdateTableHeader(index, value);
        setIsEditing(false);
    };

    const onDelete = async () => {
        setIsDeletingColumn(true);
        try {
            await deleteTableColumn(tableID, index);
            if (!isUsingSnapshot) {
                mutate([tableID, tablesUrl, 'getTable'], undefined, { revalidate: true });
            }
            setIsEditing(false);
        } finally {
            setIsDeletingColumn(false);
        }
    };

    useEffect(() => {
        setValue(column.label ?? '');
    }, [column.label, isEditing]);

    if (isEditing && isEditMode && !isUsingSnapshot) {
        return (
            <div className="flex items-stretch min-h-9 min-w-[300px] grow">
                <TextField
                    fullWidth
                    value={value}
                    onChange={setValue}
                    aria-label="Edit column title"
                    className="flex-1 min-w-0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') void onSaveValue();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                >
                    <Input placeholder="Enter a title" autoFocus className="!rounded-e-none" />
                </TextField>
                <Button
                    variant="secondary"
                    size="sm"
                    isIconOnly
                    aria-label="Cancel"
                    className="!h-9 !rounded-none -ms-px"
                    onPress={() => setIsEditing(false)}
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    isIconOnly
                    aria-label="Save"
                    className="!h-9 !rounded-s-none !rounded-e-[var(--radius)] -ms-px"
                    onPress={onSaveValue}
                >
                    <FontAwesomeIcon icon={faCheck} />
                </Button>
            </div>
        );
    }
    return (
        <div className="group relative flex items-center min-w-[300px] leading-8 w-full h-full">
            <ValuePlugins type={ENTITIES.LITERAL} datatype={MISC.DEFAULT_LITERAL_DATATYPE}>
                {column.label}
            </ValuePlugins>
            {index !== -1 && !column.label && isEditMode && <span className="text-muted text-xs leading-8">No value</span>}
            {index !== -1 && isEditMode && !isUsingSnapshot && (
                <span className="hidden group-hover:inline-block ms-2">
                    <ActionButtonView icon={faPen} action={() => setIsEditing(true)} title="Edit" />
                    <ActionButton
                        title="Delete"
                        icon={faTrash}
                        requireConfirmation
                        confirmationMessage="Are you sure you want to delete this column and all its data?"
                        isLoading={isDeletingColumn}
                        confirmationButtons={[
                            { title: 'Delete', color: 'danger', icon: faCheck, action: onDelete },
                            { title: 'Cancel', color: 'secondary', icon: faTimes },
                        ]}
                    />
                </span>
            )}
        </div>
    );
};
export default Header;
