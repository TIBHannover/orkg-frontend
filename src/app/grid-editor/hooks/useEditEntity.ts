import { useEffect, useState } from 'react';
import { ActionMeta, MultiValue } from 'react-select';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';

import useEntities from '@/app/grid-editor/hooks/useEntities';
import { OptionType } from '@/components/Autocomplete/types';
import Confirm from '@/components/ConfirmationModal/ConfirmationModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA } from '@/constants/contentTypes';
import { ENTITIES, ENTITY_CLASSES } from '@/constants/graphSettings';
import { classesUrl, getClassById, updateClass } from '@/services/backend/classes';
import { updatePredicate } from '@/services/backend/predicates';
import { updateResource } from '@/services/backend/resources';
import { Thing } from '@/services/backend/things';

const useEditEntity = (entity: Thing) => {
    const [isSaving, setIsSaving] = useState(false);
    const [label, setLabel] = useState(entity.label);
    const [draftClasses, setDraftClasses] = useState<OptionType[]>([]);
    const { key } = useEntities();
    const { user } = useAuthentication();
    const isCurationAllowed = user?.isCurationAllowed ?? false;
    const { data: classes, isLoading } = useSWR(
        entity && 'classes' in entity && entity.classes.length > 0 ? [entity.classes, classesUrl, 'getClassById'] : null,
        ([params]) => Promise.all(params.map((id) => getClassById(id))),
    );
    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (entity._class === ENTITIES.RESOURCE) {
                await updateResource(entity.id, { label, classes: draftClasses.map((c) => c.id) });
            } else if (entity._class === ENTITIES.CLASS) {
                await updateClass(entity.id, label);
            } else if (entity._class === ENTITIES.PREDICATE) {
                await updatePredicate(entity.id, label);
            } else {
                throw new Error('Invalid entity class');
            }
            mutate(key);
        } finally {
            setIsSaving(false);
            toast.success('Entity updated successfully');
        }
    };

    const handleChangeClasses = async (selected: MultiValue<OptionType>, action: ActionMeta<OptionType>) => {
        if (action.action === 'create-option') {
            const newClasses = [...selected];
            const foundIndex = selected.findIndex((x) => x.__isNew__);
            const newClass = await Confirm({
                label: selected[foundIndex].label,
            });
            if (newClass) {
                newClasses[foundIndex] = newClass as OptionType;
                setDraftClasses(newClasses as OptionType[]);
            } else {
                return null;
            }
        } else {
            const newClasses = !selected ? [] : selected;
            if (action.option && ENTITY_CLASSES.includes(action.option.id)) {
                toast.error(`The selected option ${action.option.label} cannot be set manually; it is reserved for managing entities in the system`);
            } else if (!isCurationAllowed && action.option && CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(action.option.id)) {
                toast.error(
                    `The selected option ${action.option.label} cannot be set manually; it is reserved for managing content types in the system`,
                );
            } else {
                setDraftClasses(newClasses as OptionType[]);
            }
        }
    };

    useEffect(() => {
        setDraftClasses(classes ?? []);
    }, [classes]);

    return { draftClasses, label, isLoading, isSaving, handleChangeClasses, setLabel, setIsSaving, handleSave };
};

export default useEditEntity;
