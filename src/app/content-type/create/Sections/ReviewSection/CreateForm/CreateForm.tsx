'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createReview } from '@/services/backend/reviews';

const CreateForm = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        document.title = 'Create new review - ORKG';
    });

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);
        if (!title) {
            toast.error('Enter a review title');
            return;
        }
        try {
            const id = await createReview({ title, research_fields: ['R11'] });
            router.push(`${reverse(ROUTES.REVIEW, { id })}?isEditMode=true`);
        } catch (error: unknown) {
            toast.error('An error occurred while creating the review');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form onSubmit={handleCreate}>
            <FormGroup>
                <Tooltip content="Choose the title of your review. You can always update the title later.">
                    <span>
                        <Label for="reviewTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                    </span>
                </Tooltip>

                <Input type="text" id="reviewTitle" maxLength={MAX_LENGTH_INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
            </FormGroup>
            <div className="text-end">
                <RequireAuthentication component={ButtonWithLoading} type="submit" color="primary" isLoading={isLoading}>
                    Create
                </RequireAuthentication>
            </div>
        </Form>
    );
};

export default CreateForm;
