import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateClass } from 'services/backend/classes';

const useEditClassLabel = ({ id, label, setLabel }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [draftLabel, setDraftLabel] = useState(label);

    useEffect(() => {
        setDraftLabel(label);
    }, [label]);

    const handleSubmitClick = async () => {
        if (draftLabel === label) {
            setIsEditing(false);
            return;
        }
        try {
            setIsSaving(true);
            await updateClass(id, draftLabel);
            setLabel(draftLabel);
            toast.success('Class label updated successfully');
        } catch (e) {
            toast.error('Something went wrong while updating the label');
            console.error(e);
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    return { isSaving, isEditing, setIsEditing, draftLabel, setDraftLabel, handleSubmitClick };
};

export default useEditClassLabel;
