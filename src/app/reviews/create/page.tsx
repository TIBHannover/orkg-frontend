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
import { createReview } from '@/services/backend/reviews';

const ReviewNew = () => {
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
            toast.error('Enter a paper title');
            return;
        }
        try {
            const id = await createReview({ title, research_fields: ['R11'] });
            router.push(reverse(ROUTES.REVIEW, { id }));
        } catch (error: unknown) {
            toast.error('An error occurred while creating the review');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TitleBar>Create review</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form onSubmit={handleCreate}>
                    <p>
                        ORKG reviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers. Before
                        creating a review, make sure you understand the following points:
                    </p>
                    <ul className="mt-4">
                        <li>
                            A review can be <strong>changed by anyone</strong> (indeed, just like Wikipedia)
                        </li>
                        <li>
                            To make sure you work is not removed permanently by someone else, <strong>publish the article regularly</strong>{' '}
                        </li>
                        <li>
                            Everything you write is <strong>immediately visible for everyone</strong>{' '}
                        </li>
                    </ul>
                    <hr className="mt-5 mb-4" />
                    <FormGroup>
                        <Tooltip content="Choose the title of your article. You can always update this title later">
                            <span>
                                <Label for="articleTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                            </span>
                        </Tooltip>

                        <Input type="text" id="articleTitle" maxLength={MAX_LENGTH_INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
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

export default ReviewNew;
