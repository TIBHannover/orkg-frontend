import { faQuestionCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import useSave from 'components/SmartReview/hooks/useSave';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Container, FormGroup, Input, Label } from 'reactstrap';

const SmartReviewNew = () => {
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
        history.push(reverse(ROUTES.SMART_REVIEW, { id }));
    };

    return (
        <>
            <TitleBar>Create SmartReview</TitleBar>
            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <p>
                    SmartReviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers. Before creating
                    an article, make sure you understand the following points:
                </p>
                <ul className="mt-4">
                    <li>
                        A SmartReview can be <strong>changed by anyone</strong> (indeed, just like Wikipedia)
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
                            <Label for="articleTitle">Title</Label> <Icon icon={faQuestionCircle} className="text-secondary" />
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

export default SmartReviewNew;
