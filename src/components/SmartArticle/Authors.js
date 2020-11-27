import React, { useState } from 'react';
import { SectionStyled, SectionTypeStyled } from 'components/SmartArticle/styled';
import { useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';
import { faPen, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import Tippy from '@tippy.js/react';
import AuthorsModal from 'components/SmartArticle/AuthorsModal';

const Title = () => {
    const authorResources = useSelector(state => state.smartArticle.authorResources);
    const [showModal, setShowModal] = useState(false);

    return (
        <SectionStyled className="box rounded py-3">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the authors cannot be changed">
                    <span>authors</span>
                </Tippy>
            </SectionTypeStyled>
            {authorResources.length === 0 && <span className="text-muted mr-2">No authors added yet</span>}
            {authorResources.map((author, index) =>
                author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
                    <Link key={index} to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })} target="_blank">
                        <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                            <Icon icon={faUser} className="text-primary" /> {author.label}
                        </Badge>
                    </Link>
                ) : (
                    <Badge color="lightblue" className="mr-2 mb-2" key={index}>
                        <Icon icon={faUser} className="text-darkblue" /> {author.label}
                    </Badge>
                )
            )}
            <Button size="sm" color="darkblue" className="ml-2" onClick={() => setShowModal(true)}>
                <Icon icon={faPen} /> Edit
            </Button>

            <AuthorsModal show={showModal} toggle={() => setShowModal(v => !v)} />
        </SectionStyled>
    );
};

export default Title;
