import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import ROUTES from 'constants/routes';
import { groupBy } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import { getCategories, getPages } from 'services/cms';

const HelpCenter = () => {
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            const _categories = await getCategories({ isHelpCategory: true, sort: 'order' });
            const categoryIds = _categories.map(category => category.id);
            let _articles = await getPages({ category: categoryIds });
            _articles = groupBy(_articles, 'category.id');

            setCategories(_categories);
            setArticles(_articles);
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
                                {articles[category.id] &&
                                    articles[category.id].map(article => (
                                        <li key={article.id}>
                                            <Link
                                                to={reverse(ROUTES.HELP_CENTER_ARTICLE, {
                                                    id: article.id,
                                                    slug: article.slug,
                                                    categoryId: article.category.id
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
                                    View all articles
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
