import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { times } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
import { Link } from 'react-router-dom';
import { Alert, Col, Container, Row } from 'reactstrap';
import { getHelpCategories } from 'services/cms';
import { reverseWithSlug } from 'utils';

const HelpCenter = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setHasFailed(false);

            try {
                let categories = await getHelpCategories();
                categories = categories.map(category => ({
                    ...category,
                    help_articles: category.help_articles.sort((a, b) => (parseInt(a.order) > parseInt(b.order) ? 1 : -1))
                }));
                setCategories(categories);
            } catch (e) {
                setHasFailed(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return (
        <div>
            <TitleBar>Help center</TitleBar>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <HelpCenterSearchInput />

                {hasFailed && <Alert color="danger">Help categories are not loaded because an error occurred</Alert>}
                {!isLoading && categories.length === 0 && <Alert color="info">No help categories are added</Alert>}

                {isLoading && (
                    <Row className="mt-5">
                        {times(5, i => (
                            <Col key={i} md="6">
                                <ContentLoader
                                    speed={2}
                                    width="100%"
                                    height={130}
                                    viewBox="0 0 100% 50"
                                    style={{ width: '100% !important' }}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="3" ry="3" width="400" height="35" />
                                    <rect x="0" y="40" rx="3" ry="3" width="300" height="15" />
                                    <rect x="0" y="60" rx="3" ry="3" width="200" height="15" />
                                    <rect x="0" y="80" rx="3" ry="3" width="250" height="15" />
                                </ContentLoader>
                            </Col>
                        ))}
                    </Row>
                )}

                <Row className="mt-5">
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
