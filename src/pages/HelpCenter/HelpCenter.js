import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import { getHelpCategories } from 'services/cms';
import { reverseWithSlug } from 'utils';

const HelpCenter = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setCategories(await getHelpCategories());
            setIsLoading(false);
        };

        fetchCategories();
    }, []);

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Help center</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <HelpCenterSearchInput />
                <Row className="mt-5">
                    {isLoading && 'Loading...'}
                    {categories.map(category => (
                        <Col key={category.id} md="6">
                            <h3>
                                <Link
                                    to={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                        id: category.id
                                    })}
                                    className="text-body"
                                >
                                    {category.title}
                                </Link>
                            </h3>
                            <ul className="pl-3 mb-0">
                                {category.help_articles &&
                                    category.help_articles.slice(0, 5).map(article => (
                                        <li key={article.id}>
                                            <Link
                                                to={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                                    id: article.id,
                                                    slug: article.title
                                                })}
                                            >
                                                {article.title}
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                            <div className="mt-2 mb-4">
                                <Link
                                    to={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                        id: category.id
                                    })}
                                    className="text-muted"
                                >
                                    View all {category.help_articles.length} articles
                                </Link>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default HelpCenter;
