'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import TitleBar from '@/components/TitleBar/TitleBar';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Container from '@/components/Ui/Structure/Container';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import errorHandler from '@/helpers/errorHandler';
import { createComparison } from '@/services/backend/comparisons';

const CreateComparison = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = 'Create comparison - ORKG';
    });

    const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsLoading(true);
        try {
            const comparisonId = await createComparison({
                title,
                description: '',
                research_fields: [],
                authors: [],
                contributions: [],
                data: {
                    contributions: [],
                    predicates: [],
                    data: {},
                },
                references: [],
                observatories: [],
                organizations: [],
                config: {
                    contributions: [],
                    predicates: [],
                    transpose: false,
                    type: 'PATH',
                },
                is_anonymized: false,
            });
            router.push(`${reverse(ROUTES.COMPARISON, { comparisonId })}?isEditMode=true`);
        } catch (error) {
            errorHandler({ error, shouldShowToast: true });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create comparison</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form onSubmit={handleCreate}>
                    <p>
                        <em>
                            Please note: a comparison can be <strong>changed by anyone</strong> (just like Wikipedia)
                        </em>
                    </p>

                    <hr className="mt-3 mb-4" />
                    <FormGroup>
                        <Tooltip content="Choose the title of your comparison. You can always update the title later">
                            <span>
                                <Label for="articleTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                            </span>
                        </Tooltip>

                        <Input type="text" id="articleTitle" value={title} maxLength={MAX_LENGTH_INPUT} onChange={(e) => setTitle(e.target.value)} />
                    </FormGroup>
                    <div className="text-end">
                        <ButtonWithLoading type="submit" color="primary" isLoading={isLoading}>
                            Create
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default CreateComparison;
