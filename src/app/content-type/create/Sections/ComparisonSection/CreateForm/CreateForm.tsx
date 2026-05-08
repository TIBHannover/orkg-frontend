'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useMembership from '@/components/hooks/useMembership';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Alert from '@/components/Ui/Alert/Alert';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { createComparison } from '@/services/backend/comparisons';

const CreateForm = () => {
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [sourceIds] = useQueryState<string[]>('sourceIds', {
        defaultValue: [],
        parse: (value) => value.split(','),
    });

    const { observatoryId, organizationId } = useMembership();

    useEffect(() => {
        document.title = 'Create comparison - ORKG';
    });

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsSaving(true);
        try {
            const comparisonId = await createComparison({
                title,
                description: '',
                research_fields: [],
                authors: [],
                sources:
                    sourceIds && sourceIds.length > 0
                        ? sourceIds.map((sourceId) => ({
                              id: sourceId,
                              type: 'THING',
                          }))
                        : [],
                references: [],
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
                is_anonymized: false,
            });
            router.push(`${reverse(ROUTES.COMPARISON, { comparisonId })}?isEditMode=true`);
        } catch (error) {
            errorHandler({ error, shouldShowToast: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Form onSubmit={handleCreate}>
            {sourceIds && sourceIds.length > 0 && (
                <Alert color="info">
                    A comparison will be created containing {sourceIds.length} {pluralize('entity', sourceIds.length)}, you can change this later
                </Alert>
            )}
            <FormGroup>
                <Tooltip content="Choose the title of your comparison. You can always update the title later.">
                    <span>
                        <Label for="comparisonTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                    </span>
                </Tooltip>

                <Input type="text" id="comparisonTitle" value={title} maxLength={MAX_LENGTH_INPUT} onChange={(e) => setTitle(e.target.value)} />
            </FormGroup>
            <p>
                <em>
                    Please note: a comparison can be <strong>changed by anyone</strong> (just like Wikipedia)
                </em>
            </p>
            <div className="text-end">
                <RequireAuthentication component={ButtonWithLoading} type="submit" color="primary" isLoading={isSaving}>
                    Create
                </RequireAuthentication>
            </div>
        </Form>
    );
};

export default CreateForm;
