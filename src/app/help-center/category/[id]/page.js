'use client';

import Link from 'components/NextJsMigration/Link';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import NotFound from 'app/not-found';
import { useEffect, useState } from 'react';
import useParams from 'components/NextJsMigration/useParams';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpCategory } from 'services/cms';
import { reverseWithSlug } from 'utils';

const HelpCenterCategory = () => {
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isNotFound, setIsNotFound] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        if (!id) {
            return;
        }
        const getData = async () => {
            try {
                setIsLoading(true);
                setCategory((await getHelpCategory(id)).data);
            } catch (e) {
                setIsNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [id]);

    if (isNotFound) {
        return <NotFound />;
    }

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && 'Loading...'}

                {!isLoading && category && (
                    <>
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link href={ROUTES.HELP_CENTER}>Help center</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active>{category.attributes?.title}</BreadcrumbItem>
                        </Breadcrumb>
                        <h1 className="h3 my-4">{category.attributes?.title}</h1>
                        <ul>
                            {category.attributes?.help_articles?.data?.map(article => (
                                <li key={article.id}>
                                    <Link
                                        href={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                            id: article.id,
                                            slug: article.attributes?.title,
                                        })}
                                    >
                                        {article.attributes?.title}
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
