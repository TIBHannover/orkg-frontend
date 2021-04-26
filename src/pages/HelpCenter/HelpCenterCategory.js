import ROUTES from 'constants/routes';
import NotFound from 'pages/NotFound';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpCategory } from 'services/cms';
import { reverseWithSlug } from 'utils';

const HelpCenterCategory = () => {
    const [category, setCategory] = useState(null);
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
                const _category = await getHelpCategory(params.id);
                setCategory(_category);
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
                            {category.help_articles.map(article => (
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
                    </>
                )}
            </Container>
        </div>
    );
};

export default HelpCenterCategory;
