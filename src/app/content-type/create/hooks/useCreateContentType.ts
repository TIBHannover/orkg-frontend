import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';

import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { createResource, getResource } from '@/services/backend/resources';

const CLASS_ID_TO_CLASSES = {
    [CLASSES.DATASET]: [CLASSES.DATASET, CLASSES.CREATIVEWORK, CLASSES.THING],
    [CLASSES.SOFTWARE]: [CLASSES.SOFTWARE, CLASSES.CREATIVEWORK, CLASSES.THING],
};

const useCreateContentType = (classId: string) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [resource, setResource] = useState<{ id: string } | null>(null);

    const handleCreate = async (e: FormEvent, title: string) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const _resourceId = await createResource({ label: title, classes: CLASS_ID_TO_CLASSES[classId] ?? [] });
            const _resource = await getResource(_resourceId);
            setResource(_resource);
            router.push(`${reverse(ROUTES.CONTENT_TYPE, { id: _resource.id, type: classId })}?isEditMode=true`);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
            toast.error(`Error creating resource : ${(error as Error).message}`);
        }
    };

    return {
        handleCreate,
        isLoading,
        resourceId: resource?.id,
    };
};

export default useCreateContentType;
