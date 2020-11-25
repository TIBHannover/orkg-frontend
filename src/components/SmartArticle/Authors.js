import React from 'react';
import { SectionStyled, SectionType } from 'components/SmartArticle/styled';
import { useSelector } from 'react-redux';
import { CLASSES } from 'constants/graphSettings';
import { faPen, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

const Title = () => {
    const authorResources = useSelector(state => state.smartArticle.authorResources);

    return (
        <SectionStyled className="box rounded py-3">
            <SectionType disabled>authors</SectionType>
            {authorResources.length === 0 && <span className="text-muted">No authors added yet</span>}
            {authorResources.map((author, index) =>
                author.classes && author.classes.includes(CLASSES.AUTHOR) ? (
                    <Link key={index} to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}>
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
            <Button size="sm" color="darkblue" className="ml-2">
                <Icon icon={faPen} /> Edit
            </Button>
        </SectionStyled>
    );
};

export default Title;
