import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, Col, Row } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import usePage from '@/components/Page/usePage';
import { CmsPage } from '@/components/styled';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import HELP_CENTER_ARTICLES from '@/constants/helpCenterArticles';
import ROUTES from '@/constants/routes';
import { getHelpArticle, getHelpArticles } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utils';

const EditorHelpModal = () => {
    const { isHelpModalOpen, helpCenterArticleId } = useDataBrowserState();

    const { loadPage, page, isLoading: isLoadingPage, isNotFound } = usePage();
    const dispatch = useDataBrowserDispatch();
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        const fetchCategories = () => {
            if (helpCenterArticleId) {
                const pagePromise = getHelpArticle(helpCenterArticleId);
                loadPage({ pagePromise });
                setArticles([]);
            } else {
                setIsLoading(true);
                setHasFailed(false);
                getHelpArticles({
                    where: HELP_CENTER_ARTICLES.DATA_BROWSER_ARTICLES,
                })
                    .then((result) => {
                        if (!result.data) {
                            return;
                        }
                        setArticles(result.data);
                        setIsLoading(false);
                    })
                    .catch((e) => {
                        setHasFailed(true);
                        setIsLoading(false);
                    });
            }
        };

        fetchCategories();
    }, [helpCenterArticleId, loadPage]);

    const toggleHelpModal = () => {
        dispatch({ type: 'SET_IS_HELP_MODAL_OPEN', payload: { isOpen: !isHelpModalOpen } });
    };

    return (
        <Modal isOpen={isHelpModalOpen} toggle={toggleHelpModal} size="lg">
            <ModalHeader toggle={toggleHelpModal}>
                {helpCenterArticleId && !isLoadingPage && page ? page?.attributes.title : 'ORKG Content editor help'}{' '}
            </ModalHeader>
            <ModalBody>
                {!helpCenterArticleId && (
                    <p>
                        The editor in the main part of editing ORKG Data. In this guide, we provide answers to the most frequently asked question that
                        helps to use the editor effectively.
                    </p>
                )}

                {(hasFailed || isNotFound) && <Alert color="danger">Help articles are not loaded because an error occurred</Alert>}
                {(isLoading || isLoadingPage) && (
                    <Row className="mt-3">
                        <Col md="12">
                            <ContentLoader speed={2} width={300} height={100} viewBox="0 0 300 100" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="3" ry="3" width="300" height="15" />
                                <rect x="0" y="20" rx="3" ry="3" width="250" height="15" />
                                <rect x="0" y="40" rx="3" ry="3" width="300" height="15" />
                                <rect x="0" y="60" rx="3" ry="3" width="200" height="15" />
                                <rect x="0" y="80" rx="3" ry="3" width="250" height="15" />
                            </ContentLoader>
                        </Col>
                    </Row>
                )}
                {!isLoading && articles.length > 0 && (
                    <Row className="mt-3">
                        <ul className="ms-3">
                            {articles.map((article) => (
                                <li key={article.id}>
                                    <Link
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                    </Row>
                )}
                {helpCenterArticleId && !isLoadingPage && page && (
                    <div className="pb-3 px-3">
                        <CmsPage>{page?.content}</CmsPage>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default EditorHelpModal;
