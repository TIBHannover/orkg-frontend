import React, { useState, useEffect } from 'react';
import { Container, Button, Input, FormGroup, Label } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import useSave from 'components/SmartArticle/hooks/useSave';

const SmartArticleNew = () => {
    const [title, setTitle] = useState('');
    const { create, isLoading } = useSave();

    useEffect(() => {
        document.title = 'Create new article - ORKG';
    });

    const handleCreate = () => {
        create(title);
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
                        Create
                    </Button>
                </div>
            </Container>
        </>
    );
};

export default SmartArticleNew;
