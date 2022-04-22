import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom-v5-compat';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, Input, Label } from 'reactstrap';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import { createLiteralStatement } from 'services/backend/statements';

const ListNew = () => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const displayName = useSelector(state => state.auth.user.displayName);
    const navigate = useNavigate();
    useEffect(() => {
        document.title = 'Create list - ORKG';
    });

    const handleCreate = async () => {
        if (!title) {
            toast.error('Enter a title');
            return;
        }

        setIsLoading(true);
        const { id } = await createResource(title, [CLASSES.LITERATURE_LIST]);
        const nameLiteral = await createLiteral(displayName);
        await createLiteralStatement(id, PREDICATES.HAS_AUTHOR, nameLiteral.id);
        navigate(reverse(ROUTES.LIST, { id }));
        setIsLoading(false);
    };

    return (
        <>
            <TitleBar>Create list</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <p>
                    ORKG lists provide a way to organize and describe state-of-the-art literature for a specific research domain. From lists, it is
                    possible to create ORKG comparisons.
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

                    <Input type="text" id="articleTitle" value={title} onChange={e => setTitle(e.target.value)} />
                </FormGroup>
                <div className="text-end">
                    <Button color="primary" onClick={handleCreate} disabled={isLoading}>
                        {!isLoading ? (
                            'Create'
                        ) : (
                            <>
                                <Icon icon={faSpinner} spin /> Loading
                            </>
                        )}
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default ListNew;
