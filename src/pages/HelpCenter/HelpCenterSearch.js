import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpArticles } from 'services/cms';
import { reverseWithSlug } from 'utils';

const HelpCenterSearch = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const params = useParams();

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);
                const words = params.searchQuery.split(' ');
                let whereCount = 0;
                const _articles = await getHelpArticles({
                    // can be made more readable by using an object and converting it with 'qs' package to a string
                    where: words
                        .map(word => {
                            const where = `_where[_or][${whereCount}][title_contains]=${word}&_where[_or][${whereCount +
                                1}][content_contains]=${word}`;
                            whereCount = whereCount + 2;
                            return where;
                        })
                        .join('&')
                });
                setArticles(_articles);
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [params]);

    return (
        <div>
            <TitleBar>Help center</TitleBar>

            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
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
                )}
                {!isLoading && articles.length === 0 && <p>No articles are found, please try another search query</p>}
            </Container>
        </div>
    );
};

export default HelpCenterSearch;
