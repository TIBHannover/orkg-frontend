import { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Alert, Col, Row } from 'reactstrap';
import { getHelpArticles } from 'services/cms';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';

import { reverseWithSlug } from 'utils';

const SBEditorHelpModal = props => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState([]);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        const fetchCategories = () => {
            setIsLoading(true);
            setHasFailed(false);
            getHelpArticles({
                where: '&help_category=2&_sort=order&_where[_or][0][title_contains]=tips&_where[_or][1][title_contains]=how to'
            })
                .then(result => {
                    setArticles(result);
                    setIsLoading(false);
                })
                .catch(e => {
                    setHasFailed(true);
                    setIsLoading(false);
                });
        };

        fetchCategories();
    }, []);

    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>ORKG data editor help</ModalHeader>

            <ModalBody>
                <p>
                    The editor in the main part of editing ORKG Data. In this guide, we provide answers to the most frequently asked question that
                    helps to use the editor effectively.
                </p>
                {hasFailed && <Alert color="danger">Help articles are not loaded because an error occurred</Alert>}
                {isLoading && (
                    <Row className="mt-3">
                        <Col md="12">
                            <ContentLoader
                                speed={2}
                                width="100%"
                                height={130}
                                viewBox="0 0 100% 50"
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

                <Row className="mt-3">
                    {!isLoading && articles.length > 0 && (
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
                    )}
                </Row>
            </ModalBody>
        </Modal>
    );
};

SBEditorHelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default SBEditorHelpModal;
