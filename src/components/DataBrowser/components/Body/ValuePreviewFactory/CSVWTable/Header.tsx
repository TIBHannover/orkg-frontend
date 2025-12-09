import { faCheck, faClose, faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useSWRConfig } from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';
import { ColType } from '@/components/DataBrowser/types/DataBrowserTypes';
import Button from '@/components/Ui/Button/Button';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
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

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(column.label ?? '');
    }, [column.label, isEditing]);

    if (isEditing && isEditMode && !isUsingSnapshot) {
        return (
            <div className="d-flex flex-column flex-grow-1 tw:min-w-[300px] ">
                <InputGroup size="sm" className="flex-grow-1 flex-nowrap">
                    <Input type="text" bsSize="sm" value={value ?? ''} onChange={(e) => setValue(e.target.value)} placeholder="Enter a title" />
                    <Button
                        size="sm"
                        type="submit"
                        color="secondary"
                        className="px-2"
                        onClick={() => {
                            setIsEditing(false);
                        }}
                        title="Cancel"
                    >
                        <FontAwesomeIcon icon={faClose} />
                    </Button>
                    <Button className="px-2" size="sm" type="submit" color="primary" onClick={onSaveValue} title="Save">
                        <span>
                            <FontAwesomeIcon icon={faCheck} />
                        </span>
                    </Button>
                </InputGroup>
            </div>
        );
    }
    return (
        <div className="tw:group tw:relative tw:flex tw:items-center tw:min-w-[300px] tw:leading-8 tw:w-full tw:h-full">
            <ValuePlugins type={ENTITIES.LITERAL} datatype={MISC.DEFAULT_LITERAL_DATATYPE}>
                {column.label}
            </ValuePlugins>
            {index !== -1 && !column.label && isEditMode && <span className="tw:text-gray-500 tw:text-xs tw:leading-8">No value</span>}
            {index !== -1 && isEditMode && !isUsingSnapshot && (
                <span className="tw:hidden tw:group-hover:inline-block tw:ms-2">
                    <ActionButtonView icon={faPen} action={() => setIsEditing(true)} title="Edit" />

                    <ActionButton
                        title="Delete"
                        icon={faTrash}
                        requireConfirmation
                        confirmationMessage="Are you sure you want to delete this column and all its data?"
                        isLoading={isDeletingColumn}
                        confirmationButtons={[
                            {
                                title: 'Delete',
                                color: 'danger',
                                icon: faCheck,
                                action: onDelete,
                            },
                            {
                                title: 'Cancel',
                                color: 'secondary',
                                icon: faTimes,
                            },
                        ]}
                    />
                </span>
            )}
        </div>
    );
};
export default Header;
