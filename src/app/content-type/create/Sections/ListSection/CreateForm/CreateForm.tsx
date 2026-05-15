'use client';

import { Form, Input, Label, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useId, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createResource } from '@/services/backend/resources';

const CreateForm = () => {
    const titleId = useId();
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = 'Create list - ORKG';
    });

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.danger('Enter a title');
            return;
        }

        setIsLoading(true);
        const id = await createResource({ label: title, classes: [CLASSES.LITERATURE_LIST] });
        router.push(`${reverse(ROUTES.LIST, { id })}?isEditMode=true`);
        setIsLoading(false);
    };

    return (
        <Form onSubmit={handleCreate} className="flex flex-col gap-2">
            <Label htmlFor={titleId} className="block">
                Title
            </Label>
            <div className="flex items-stretch w-full">
                <TextField className="min-w-0 flex-1" value={title} onChange={setTitle} isDisabled={isLoading} isRequired aria-label="Title">
                    <Input id={titleId} type="text" maxLength={MAX_LENGTH_INPUT} className="!rounded-e-none !h-11" />
                </TextField>
                <RequireAuthentication
                    component={ButtonWithLoading}
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="!h-11 !rounded-s-none -ms-px px-4"
                >
                    Create
                </RequireAuthentication>
            </div>
        </Form>
    );
};

export default CreateForm;
