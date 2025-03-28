'use client';

import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Form, FormGroup, Input, Label } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import TitleBar from '@/components/TitleBar/TitleBar';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import requireAuthentication from '@/requireAuthentication';
import { createPredicate } from '@/services/backend/predicates';

const AddProperty = () => {
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Set document title
        document.title = 'Add property - ORKG';
    }, []);

    const handleAdd = async (e: MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        if (label.trim() !== '') {
            try {
                const newProperty = await createPredicate(label);
                toast.success('Property created successfully');
                setIsLoading(false);
                router.push(`${reverse(ROUTES.PROPERTY, { id: newProperty.id })}?isEditMode=true`);
            } catch (error) {
                errorHandler({ error, shouldShowToast: true });
                setIsLoading(false);
            }
        } else {
            toast.error('Please enter a property label');
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create property</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form>
                    <div className="pt-2">
                        <FormGroup>
                            <Label for="propertyLabel">Property label</Label>
                            <Input
                                onChange={(e) => setLabel(e.target.value)}
                                onKeyDown={(e) => (e.keyCode === 13 ? handleAdd : undefined)}
                                type="text"
                                maxLength={MAX_LENGTH_INPUT}
                                name="value"
                                id="propertyLabel"
                                disabled={isLoading}
                            />
                        </FormGroup>
                        <ButtonWithLoading type="submit" color="primary" onClick={handleAdd} className="mt-3 mb-2" isLoading={isLoading}>
                            Create property
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default requireAuthentication(AddProperty);
