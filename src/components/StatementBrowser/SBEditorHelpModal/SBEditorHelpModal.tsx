import Link from 'next/link';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import ROUTES from 'constants/routes';
import { useEffect, useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import { getHelpArticle, getHelpArticles } from 'services/cms';
import { HelpArticle } from 'services/cms/types';
import { setIsHelpModalOpen } from 'slices/statementBrowserSlice';
import { RootStore } from 'slices/types';
import { reverseWithSlug } from 'utils';

const SBEditorHelpModal = () => {
    const isHelpModalOpen = useSelector((state: RootStore) => state.statementBrowser.isHelpModalOpen);
    const helpCenterArticleId = useSelector((state: RootStore) => state.statementBrowser.helpCenterArticleId);
    const { loadPage, page, isLoading: isLoadingPage, isNotFound } = usePage();
    const dispatch = useDispatch();
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
                    where: HELP_CENTER_ARTICLES.SB_ARTICLES,
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

    return (
        <Modal isOpen={isHelpModalOpen} toggle={() => dispatch(setIsHelpModalOpen({ isOpen: !isHelpModalOpen }))} size="lg">
            <ModalHeader toggle={() => dispatch(setIsHelpModalOpen({ isOpen: !isHelpModalOpen }))}>
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

export default SBEditorHelpModal;
