'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import useRouter from 'components/NextJsMigration/useRouter';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Container, Form, FormGroup, Input, Label } from 'reactstrap';
import { createResource } from 'services/backend/resources';

const ListNew = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        document.title = 'Create list - ORKG';
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsLoading(true);
        const { id } = await createResource(title, [CLASSES.LITERATURE_LIST]);
        router.push(reverse(ROUTES.LIST, { id }));
        setIsLoading(false);
    };

    return (
        <>
            <TitleBar>Create list</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Form>
                    <p>
                        ORKG lists provide a way to organize and describe state-of-the-art literature for a specific research domain. From lists, it
                        is possible to create ORKG comparisons.
                    </p>
                    <p>
                        <em>
                            Please note: a list can be <strong>changed by anyone</strong> (just like Wikipedia)
                        </em>
                    </p>

                    <hr className="mt-5 mb-4" />
                    <FormGroup>
                        <Tippy content="Choose the title of your list. You can always update the title later">
                            <span>
                                <Label for="articleTitle">Title</Label> <Icon icon={faQuestionCircle} className="text-secondary" />
                            </span>
                        </Tippy>

                        <Input type="text" id="articleTitle" value={title} maxLength={MAX_LENGTH_INPUT} onChange={(e) => setTitle(e.target.value)} />
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

export default ListNew;
