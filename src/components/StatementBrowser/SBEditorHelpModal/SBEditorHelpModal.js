import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Alert, Col, Row } from 'reactstrap';
import { getHelpArticles, getHelpArticle } from 'services/cms';
import usePage from 'components/Page/usePage';
import { CmsPage } from 'components/styled';
import ContentLoader from 'react-content-loader';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { setIsHelpModalOpen } from 'slices/statementBrowserSlice';
import { reverseWithSlug } from 'utils';

const SBEditorHelpModal = () => {
    const isHelpModalOpen = useSelector(state => state.statementBrowser.isHelpModalOpen);
    const helpCenterArticleId = useSelector(state => state.statementBrowser.helpCenterArticleId);
    const { loadPage, page, isLoading: isLoadingPage, isNotFound } = usePage();
    const dispatch = useDispatch();
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchCategories = () => {
            if (helpCenterArticleId) {
                const pagePromise = getHelpArticle(helpCenterArticleId);
                loadPage({ pagePromise });
                setArticles([]);
            } else {
                setIsLoading(true);
                setHasFailed(false);
                getHelpArticles({
                    where: HELP_CENTER_ARTICLES.SB_ARTICLES
                })
                    .then(result => {
                        if (isMounted) {
                            setArticles(result);
                            setIsLoading(false);
                        }
                    })
                    .catch(e => {
                        setHasFailed(true);
                        setIsLoading(false);
                    });
            }
        };

        fetchCategories();
        return () => {
            isMounted = false;
        };
    }, [helpCenterArticleId, loadPage]);

    return (
        <Modal isOpen={isHelpModalOpen} toggle={() => dispatch(setIsHelpModalOpen({ isOpen: !isHelpModalOpen }))} size="lg">
            <ModalHeader toggle={() => dispatch(setIsHelpModalOpen({ isOpen: !isHelpModalOpen }))}>
                {helpCenterArticleId && !isLoadingPage && page ? page?.title : 'ORKG Content editor help'}{' '}
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
                            <ContentLoader
                                speed={2}
                                width={300}
                                height={100}
                                viewBox="0 0 300 100"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
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
                        <ul>
                            {articles.map(article => (
                                <li key={article.id}>
                                    <Link
                                        target="_blank"
                                        rel="noopener noreferrer"
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
