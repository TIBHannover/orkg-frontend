'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import Tooltip from '@/components/FloatingUI/Tooltip';
import TitleBar from '@/components/TitleBar/TitleBar';
import Form from '@/components/Ui/Form/Form';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Container from '@/components/Ui/Structure/Container';
import { CLASSES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createResource } from '@/services/backend/resources';

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
        const id = await createResource({ label: title, classes: [CLASSES.LITERATURE_LIST] });
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
                        <Tooltip content="Choose the title of your list. You can always update the title later">
                            <span>
                                <Label for="articleTitle">Title</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                            </span>
                        </Tooltip>

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
