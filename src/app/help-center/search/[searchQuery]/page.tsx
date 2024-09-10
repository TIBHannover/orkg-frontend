'use client';

import HelpCenterSearchInput from 'components/HelpCenterSearchInput/HelpCenterSearchInput';
import Link from 'next/link';
import useParams from 'components/useParams/useParams';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { useEffect, useState } from 'react';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { getHelpArticles } from 'services/cms';
import { HelpArticle } from 'services/cms/types';
import { reverseWithSlug } from 'utils';

const HelpCenterSearch = () => {
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { searchQuery } = useParams();

    useEffect(() => {
        const getData = async () => {
            try {
                setIsLoading(true);
                const words = searchQuery?.toString().split(' ');
                let whereCount = 0;
                const whereString = words
                    ?.map((word) => {
                        const where = `filters[$or][${whereCount}][title][$containsi]=${word}&filters[$or][${
                            whereCount + 1
                        }][content][$containsi]=${word}`;
                        whereCount += 2;
                        return where;
                    })
                    .join('&');

                const _articles = await getHelpArticles({ where: whereString || '' });
                setArticles(_articles.data);
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        };
        getData();
    }, [searchQuery]);

    return (
        <div>
            <TitleBar>Help center</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {isLoading && 'Loading...'}
                <HelpCenterSearchInput />

                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link href={ROUTES.HELP_CENTER}>Help center</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>Search results</BreadcrumbItem>
                </Breadcrumb>
                <h1 className="h3 my-4">Search results ({articles.length})</h1>

                {isLoading && 'Loading...'}
                {!isLoading && articles.length > 0 && (
                    <ul>
                        {articles.map((article) => (
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
                )}
                {!isLoading && articles.length === 0 && <p>No articles are found, please try another search query</p>}
            </Container>
        </div>
    );
};

export default HelpCenterSearch;
