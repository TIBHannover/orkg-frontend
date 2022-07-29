import { faCalendar, faLink, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ViewVisualizationModal = ({ isOpen, toggle, data, onEditVisualization }) => {
    const handleEditVisualization = () => {
        onEditVisualization();
        toggle();
    };

    return (
        <Modal size="lg" isOpen={isOpen} toggle={toggle} style={{ maxWidth: '90%' }}>
            <ModalHeader toggle={toggle}>View visualization</ModalHeader>
            <ModalBody>
                <div className="d-flex">
                    <h5>{data.label ?? 'No Title'}</h5>
                    <Tippy content="Go to resource page">
                        <Link target="_blank" className="ms-2 resourceLink" to={reverse(ROUTES.RESOURCE, { id: data.id })}>
                            <Icon icon={faLink} className="text-primary" />
                        </Link>
                    </Tippy>
                </div>
                {data.description ?? 'No Description'}
                <div className="mt-2">
                    <Badge color="light" className="me-2">
                        <Icon icon={faCalendar} className="text-primary" /> {data.created_at ? moment(data.created_at).format('DD MMMM YYYY') : ''}
                    </Badge>
                    {data.authors &&
                        data.authors.length > 0 &&
                        data.authors.map(author => {
                            if (author && author.class === ENTITIES.RESOURCE) {
                                return (
                                    <Link
                                        className="d-inline-block me-2 mb-2"
                                        to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                                        key={`author${author.id}`}
                                    >
                                        <Badge color="light">
                                            <Icon icon={faUser} className="text-primary" /> {author.label}
                                        </Badge>
                                    </Link>
                                );
                            }
                            return (
                                <Badge key={`author${author.id}`} color="light" className="me-2 mb-2">
                                    <Icon icon={faUser} /> {author.label}
                                </Badge>
                            );
                        })}
                </div>
                <hr />
                <GDCVisualizationRenderer height="500px" model={data.reconstructionModel} />
            </ModalBody>
            <ModalFooter>
                <Button onClick={handleEditVisualization} color="light">
                    Edit visualization
                </Button>
                <Button onClick={toggle} color="primary">
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ViewVisualizationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onEditVisualization: PropTypes.func.isRequired,
    data: PropTypes.object,
};

export default ViewVisualizationModal;
