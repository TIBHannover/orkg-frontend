import { faPen } from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Spinner, TextField, toast } from '@heroui/react';
import { FC, useEffect, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import CuratorModal from '@/components/CuratorModal/CuratorModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { updateClass } from '@/services/backend/classes';
import { updatePredicate } from '@/services/backend/predicates';
import { updateResource } from '@/services/backend/resources';

type EditableHeaderProp = {
    id: string;
    value: string;
    onChange: (arg: string) => void;
    entityType: (typeof ENTITIES)[keyof typeof ENTITIES];
    curatorsOnly?: boolean;
};

const EditableHeader: FC<EditableHeaderProp> = ({ entityType, id, onChange, curatorsOnly = false, value }) => {
    const [label, setLabel] = useState<string>(value);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isOpenCuratorModal, setIsOpenCuratorModal] = useState(false);

    const { isCurationAllowed } = useAuthentication();

    const handleSubmitClick = async () => {
        setIsLoading(true);

        try {
            if (entityType === ENTITIES.RESOURCE) {
                await updateResource(id, { label });
            } else if (entityType === ENTITIES.PREDICATE) {
                await updatePredicate(id, label);
            } else if (entityType === ENTITIES.CLASS) {
                await updateClass(id, label);
            }
            toast.success('Label updated successfully');
            onChange(label);
            setIsEditMode(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.danger(`Error updating resource : ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setLabel(value);
    }, [value]);

    const handleCancelClick = () => {
        setIsEditMode(false);
        setLabel(value);
    };

    const handleEditClick = () => {
        if (curatorsOnly && !isCurationAllowed) {
            setIsOpenCuratorModal(true);
            return;
        }
        setIsEditMode(true);
    };

    const headingTypography = 'text-[1.3rem] font-bold leading-tight';

    return (
        <div className="min-h-11 flex items-center">
            {!isEditMode && (
                <h3 className={`${headingTypography} m-0 px-3 w-full flex flex-wrap items-center gap-2`}>
                    <span className="break-words">{label || <small className="italic">No label</small>}</span>
                    {id.split(':')[0] === 'wikidata' ? (
                        <ActionButton title="Wikidata cannot be edit" isDisabled icon={faPen} action={handleEditClick} />
                    ) : (
                        <span className="inline-flex">
                            <ActionButton title="Edit label" icon={faPen} action={handleEditClick} />
                        </span>
                    )}
                </h3>
            )}
            {isEditMode && (
                <div className="flex items-stretch w-full">
                    <TextField
                        fullWidth
                        value={label}
                        onChange={setLabel}
                        aria-label="Edit label"
                        isDisabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isLoading) void handleSubmitClick();
                            if (e.key === 'Escape') handleCancelClick();
                        }}
                        className="flex-1 min-w-0"
                    >
                        <Input
                            autoFocus
                            maxLength={MAX_LENGTH_INPUT}
                            className={`!rounded-e-none !h-11 ${headingTypography.replace(/(^|\s)/g, '$1!')}`}
                        />
                    </TextField>
                    <Button
                        variant="secondary"
                        size="sm"
                        isDisabled={isLoading}
                        className="!h-11 !rounded-none -ms-px px-4"
                        onPress={handleCancelClick}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        isDisabled={isLoading}
                        className="!h-11 !rounded-s-none !rounded-e-[var(--radius)] -ms-px px-4"
                        onPress={handleSubmitClick}
                    >
                        {isLoading ? <Spinner size="sm" /> : 'Done'}
                    </Button>
                </div>
            )}
            {isOpenCuratorModal && <CuratorModal toggle={() => setIsOpenCuratorModal((v) => !v)} />}
        </div>
    );
};

export default EditableHeader;
