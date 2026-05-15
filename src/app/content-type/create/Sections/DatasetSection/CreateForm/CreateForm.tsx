'use client';

import { Button, Form, Input, Label, TextField } from '@heroui/react';
import { FC, useId, useState } from 'react';

import useCreateContentType from '@/app/content-type/create/hooks/useCreateContentType';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { MAX_LENGTH_INPUT } from '@/constants/misc';

type CreateFormProps = {
    classId: string;
};

const CreateForm: FC<CreateFormProps> = ({ classId }) => {
    const titleId = useId();
    const [title, setTitle] = useState('');
    const { handleCreate, isLoading, resourceId } = useCreateContentType(classId);

    return (
        <Form onSubmit={(e) => handleCreate(e, title)} className="flex flex-col gap-2">
            <Label htmlFor={titleId} className="block">
                Title
            </Label>
            <div className="flex items-stretch w-full">
                <TextField className="min-w-0 flex-1" value={title} onChange={setTitle} isDisabled={isLoading} isRequired aria-label="Title">
                    <Input id={titleId} name="value" maxLength={MAX_LENGTH_INPUT} className="!rounded-e-none !h-11" />
                </TextField>
                {!resourceId && (
                    <RequireAuthentication
                        component={Button}
                        type="submit"
                        variant="primary"
                        isDisabled={isLoading}
                        className="!h-11 !rounded-s-none -ms-px px-4"
                    >
                        Create
                    </RequireAuthentication>
                )}
            </div>
        </Form>
    );
};

export default CreateForm;
