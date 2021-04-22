import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getPages } from 'services/cms';

const HelpCenterSearch = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);
                const words = params.searchQuery.split(' ');
                const _articles = await getPages({
                    category: params.id,
                    // can be made more readable by using an object and converting it with 'qs' package to a string
                    where: `_where[category.is_help_category]=true&_where[_or][0][title_contains]=${words}&_where[_or][1][content_contains]=${words}`
                });
                setArticles(_articles);
            } catch (e) {
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [params]);

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">Help center</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                {isLoading && 'Loading...'}
                <HelpCenterSearchInput />

                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={ROUTES.HELP_CENTER}>Help center</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>Search results</BreadcrumbItem>
                </Breadcrumb>
                <h1 className="h3 my-4">Search results ({articles.length})</h1>

                {isLoading && 'Loading...'}
                {!isLoading && articles.length > 0 && (
                    <ul>
                        {articles.map(article => (
                            <li key={article.id}>
                                <Link
                                    to={reverse(ROUTES.HELP_CENTER_ARTICLE, {
                                        id: article.id,
                                        slug: article.slug,
                                        categoryId: article?.category?.id
                                    })}
                                >
                                    {article.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
                {!isLoading && articles.length === 0 && <p>No articles are found, please try another search query</p>}
            </Container>
        </div>
    );
};

export default HelpCenterSearch;
