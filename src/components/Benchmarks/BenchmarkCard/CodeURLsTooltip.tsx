import { faFirefox, faGithub, faGitlab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Modal, ModalBody, ModalHeader, Table } from 'reactstrap';

import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';

function getCodeIconByURL(url: string) {
    let faIcon = faFirefox;
    if (url.includes('gitlab')) {
        faIcon = faGitlab;
    } else if (url.includes('github')) {
        faIcon = faGithub;
    }
    return faIcon;
}

type CodeURLsTooltipProps = {
    urls: string[];
    title: string;
    id: string;
};

const CodeURLsTooltip: FC<CodeURLsTooltipProps> = ({ urls, title, id }) => {
    const [showModal, setShowModal] = useState(false);

    if (urls?.length === 1) {
        return (
            <a href={urls[0] ?? '-'} rel="noreferrer" target="_blank">
                <FontAwesomeIcon icon={getCodeIconByURL(urls[0])} color="primary" className="icon ms-2 me-2" />
            </a>
        );
    }
    return (
        <>
            <Modal isOpen={showModal} toggle={() => setShowModal((v) => !v)} size="lg">
                <ModalHeader toggle={() => setShowModal((v) => !v)}>
                    {' '}
                    <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: id })} style={{ textDecoration: 'none' }}>
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
                            {urls?.map((url, index) => (
                                <tr key={index}>
                                    <td>
                                        <a href={url ?? '-'} rel="noreferrer" target="_blank" className="text-dark">
                                            <FontAwesomeIcon icon={getCodeIconByURL(url)} className="icon ms-2 me-2" /> {url}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ModalBody>
            </Modal>
            <Button className="p-0" color="link" onClick={() => setShowModal((v) => !v)}>
                <FontAwesomeIcon icon={faGithub} color="#e86161" className="icon ms-2 me-2" />
            </Button>
        </>
    );
};

export default CodeURLsTooltip;
