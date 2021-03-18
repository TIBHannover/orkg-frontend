import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import useSave from 'components/SmartArticle/hooks/useSave';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, Input, Label } from 'reactstrap';

const SmartArticleNew = () => {
    const [title, setTitle] = useState('');
    const { create, isLoading } = useSave();
    const history = useHistory();

    useEffect(() => {
        document.title = 'Create new article - ORKG';
    });

    const handleCreate = async () => {
        if (!title) {
            toast.error('Enter a paper title');
            return;
        }
        const id = await create(title);
        history.push(reverse(ROUTES.SMART_ARTICLE, { id }));
    };

    return (
        <>
            <Container>
                <div className="d-flex align-items-center">
                    <h1 className="h4 mt-4 mb-4 flex-grow-1">Create new article</h1>
                </div>
            </Container>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <FormGroup>
                    <Tippy content="Choose the title of your article. You can always update this title later">
                        <span>
                            <Label for="articleTitle">Title</Label> <Icon icon={faQuestionCircle} className="text-darkblue" />
                        </span>
                    </Tippy>

                    <Input type="text" id="articleTitle" value={title} onChange={e => setTitle(e.target.value)} />
                </FormGroup>
                <div className="text-right">
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

export default SmartArticleNew;
