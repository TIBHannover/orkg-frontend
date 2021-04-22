import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getCategory, getPages } from 'services/cms';

const HelpCenterCategory = () => {
    const [category, setCategory] = useState(null);
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const params = useParams();

    useEffect(() => {
        if (!params?.id) {
            return;
        }
        const getData = async () => {
            try {
                setIsLoading(true);
                const _category = await getCategory(params.id);
                const _articles = await getPages({ category: params.id, sort: 'order' });
                setCategory(_category);
                setArticles(_articles);
            } catch (e) {
                setIsNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [params]);

    if (isNotFound) {
        return <NotFound />;
    }
    console.log(category);
    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Help center</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {isLoading && 'Loading...'}

                {!isLoading && category && (
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={ROUTES.HELP_CENTER}>Help center</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>{category.title}</BreadcrumbItem>
                        </Breadcrumb>
                        <h1 className="h3 my-4">{category.title}</h1>
                        <ul>
                            {articles.map(article => (
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
                    </>
                )}
            </Container>
        </div>
    );
};

export default HelpCenterCategory;
