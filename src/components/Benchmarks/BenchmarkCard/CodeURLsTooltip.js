import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Table } from 'reactstrap';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faGithub, faGitlab, faFirefox } from '@fortawesome/free-brands-svg-icons';

function getCodeIconByURL(url) {
    let faIcon = faFirefox;
    if (url.includes('gitlab')) {
        faIcon = faGitlab;
    } else if (url.includes('github')) {
        faIcon = faGithub;
    }
    return faIcon;
}

const CodeURLsTooltip = ({ urls, title, id }) => {
    const [showModal, setShowModal] = useState(false);

    if (urls?.length === 1) {
        return (
            <a href={urls[0] ?? '-'} rel="noreferrer" target="_blank">
                <Icon icon={getCodeIconByURL(urls[0])} color="primary" className="icon ms-2 me-2" />
            </a>
        );
    }
    return (
        <>
            <Modal isOpen={showModal} toggle={() => setShowModal(v => !v)} size="lg">
                <ModalHeader toggle={() => setShowModal(v => !v)}>
                    {' '}
                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: id })} style={{ textDecoration: 'none' }}>
                        {title}
                    </Link>
                </ModalHeader>
                <ModalBody>
                    <Table striped hover bordered>
                        <thead>
                            <tr>
                                <th>Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {urls.map((url, index) => (
                                <tr key={index}>
                                    <td>
                                        <a href={url ?? '-'} rel="noreferrer" target="_blank" className="text-dark">
                                            <Icon icon={getCodeIconByURL(url)} className="icon ms-2 me-2" /> {url}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ModalBody>
            </Modal>

            <Button className="p-0" color="link" onClick={() => setShowModal(v => !v)}>
                <Icon icon={faGithub} color="#e86161" className="icon ms-2 me-2" />
            </Button>
        </>
    );
};

CodeURLsTooltip.propTypes = {
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    urls: PropTypes.array.isRequired,
};
export default CodeURLsTooltip;
