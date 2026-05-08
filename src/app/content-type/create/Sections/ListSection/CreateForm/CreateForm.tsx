'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import { CLASSES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createResource } from '@/services/backend/resources';

const CreateForm = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        document.title = 'Create list - ORKG';
    });

    const handleCreate = async (e: any) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsLoading(true);
        const id = await createResource({ label: title, classes: [CLASSES.LITERATURE_LIST] });
        router.push(`${reverse(ROUTES.LIST, { id })}?isEditMode=true`);
        setIsLoading(false);
    };

    return (
        <Form onSubmit={handleCreate}>
            <FormGroup>
                <Tooltip content="Choose the title of your list. You can always update the title later.">
                    <span>
                        <Label for="articleTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                    </span>
                </Tooltip>

                <Input type="text" id="articleTitle" value={title} maxLength={MAX_LENGTH_INPUT} onChange={(e) => setTitle(e.target.value)} />
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
