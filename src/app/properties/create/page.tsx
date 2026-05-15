'use client';

import { Form, Input, Label, TextField, toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';
import { createPredicate } from '@/services/backend/predicates';

const AddProperty = () => {
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = 'Add property - ORKG';
    }, []);

    const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (label.trim() !== '') {
            try {
                const newPropertyId = await createPredicate(label);
                toast.success('Property created successfully');
                setIsLoading(false);
                router.push(`${reverse(ROUTES.PROPERTY, { id: newPropertyId })}?isEditMode=true`);
            } catch (error) {
                errorHandler({ error, shouldShowToast: true });
                setIsLoading(false);
            }
        } else {
            toast.danger('Please enter a property label');
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create property</TitleBar>
            <Container>
                <div className="box rounded pt-6 pb-6 pl-12 pr-12">
                    <Form className="flex flex-col gap-6 pt-2" onSubmit={handleAdd}>
                        <TextField fullWidth isDisabled={isLoading} name="value">
                            <Label htmlFor="propertyLabel">Property label</Label>
                            <Input
                                id="propertyLabel"
                                type="text"
                                maxLength={MAX_LENGTH_INPUT}
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </TextField>

                        <ButtonWithLoading type="submit" variant="primary" className="mt-2 w-fit" isLoading={isLoading}>
                            Create property
                        </ButtonWithLoading>
                    </Form>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(AddProperty);
