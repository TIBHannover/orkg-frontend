'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { useRouter } from 'next/navigation';
import useSave from 'components/Review/hooks/useSave';
import TitleBar from 'components/TitleBar/TitleBar';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Form, FormGroup, Input, Label } from 'reactstrap';

const ReviewNew = () => {
    const [title, setTitle] = useState('');
    const { create, isLoading } = useSave();
    const router = useRouter();
    useEffect(() => {
        document.title = 'Create new review - ORKG';
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a paper title');
            return;
        }
        const id = await create(title);
        router.push(reverse(ROUTES.REVIEW, { id }));
    };

    return (
        <>
            <TitleBar>Create review</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form>
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
                        <Tippy content="Choose the title of your article. You can always update this title later">
                            <span>
                                <Label for="articleTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                            </span>
                        </Tippy>

                        <Input type="text" id="articleTitle" maxLength={MAX_LENGTH_INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </FormGroup>
                    <div className="text-end">
                        <ButtonWithLoading type="submit" color="primary" onClick={handleCreate} isLoading={isLoading}>
                            Create
                        </ButtonWithLoading>
                    </div>
                </Form>
            </Container>
        </>
    );
};

export default ReviewNew;
