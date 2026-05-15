'use client';

import { Alert, Input, Label, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { SyntheticEvent, useEffect, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useMembership from '@/components/hooks/useMembership';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { reverse } from '@/lib/namedRoute';
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

    const handleCreate = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title) {
            toast.danger('Enter a title');
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
        <form onSubmit={handleCreate}>
            <p className="m-0 mb-4">
                <em>
                    Please note: a comparison can be <strong>changed by anyone</strong> (just like Wikipedia)
                </em>
            </p>
            {sourceIds && sourceIds.length > 0 && (
                <Alert status="accent" className="mb-4">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            A comparison will be created containing {sourceIds.length} {pluralize('entity', sourceIds.length)}, you can change this
                            later
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <TextField fullWidth isDisabled={isSaving} value={title} onChange={setTitle} className="mb-4">
                <Label htmlFor="comparisonTitle">
                    Title
                    <Tooltip message="Choose the title of your comparison. You can always update the title later" />
                </Label>
                <Input id="comparisonTitle" type="text" maxLength={MAX_LENGTH_INPUT} />
            </TextField>
            <div className="text-right">
                <RequireAuthentication component={ButtonWithLoading} type="submit" variant="primary" isLoading={isSaving}>
                    Create
                </RequireAuthentication>
            </div>
        </form>
    );
};

export default CreateForm;
