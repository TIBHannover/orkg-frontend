'use client';

import { Form, Input, Label, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { SyntheticEvent, useEffect, useId, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { createReview } from '@/services/backend/reviews';

const CreateForm = () => {
    const titleId = useId();
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = 'Create new review - ORKG';
    });

    const handleCreate = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title) {
            toast.danger('Enter a paper title');
            return;
        }
        setIsLoading(true);
        try {
            const id = await createReview({ title, research_fields: ['R11'] });
            router.push(`${reverse(ROUTES.REVIEW, { id })}?isEditMode=true`);
        } catch (error: unknown) {
            toast.danger('An error occurred while creating the review');
        } finally {
            setIsLoading(false);
        }
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
