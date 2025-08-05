'use client';

import { times } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import HelpCenterSearchInput from '@/components/HelpCenterSearchInput/HelpCenterSearchInput';
import TitleBar from '@/components/TitleBar/TitleBar';
import Alert from '@/components/Ui/Alert/Alert';
import Col from '@/components/Ui/Structure/Col';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import ROUTES from '@/constants/routes';
import { getHelpCategories } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utils';

const HelpCenter = () => {
    const [categories, setCategories] = useState<HelpArticle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setHasFailed(false);
            try {
                setCategories((await getHelpCategories()).data);
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
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <HelpCenterSearchInput />

                {hasFailed && <Alert color="danger">Help categories are not loaded because an error occurred</Alert>}
                {!isLoading && categories.length === 0 && <Alert color="info">No help categories are added</Alert>}

                {isLoading && (
                    <Row className="mt-5">
                        {times(5, (i) => (
                            <Col key={i} md="6">
                                <ContentLoader speed={2} width="100%" height={130} viewBox="0 0 100% 50" style={{ width: '100% !important' }}>
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
                    {categories.map((category) => (
                        <Col key={category.id} md="6">
                            <h2 className="h4">
                                <Link
                                    href={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                        id: category.id,
                                    })}
                                    className="text-body"
                                >
                                    {category.attributes.title}
                                </Link>
                            </h2>
                            <ul className="ps-3 mb-0">
                                {category.attributes?.help_articles?.data?.slice(0, 5)?.map((article) => (
                                    <li key={article.id}>
                                        <Link
                                            href={reverseWithSlug(ROUTES.HELP_CENTER_ARTICLE, {
                                                id: article.id,
                                                slug: article.attributes.title,
                                            })}
                                        >
                                            {article.attributes.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2 mb-4">
                                <Link
                                    href={reverse(ROUTES.HELP_CENTER_CATEGORY, {
                                        id: category.id,
                                    })}
                                    className="text-muted"
                                >
                                    View all {category.attributes?.help_articles?.data?.length} articles
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
