import { faFirefox, faGithub, faGitlab } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, Table as HeroUITable, tableVariants } from '@heroui/react';
import Link from 'next/link';
import { FC, useState } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

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
    const [isOpen, setIsOpen] = useState(false);
    const tableSlots = tableVariants({ variant: 'primary' });

    if (urls?.length === 1) {
        return (
            <a href={urls[0] ?? '-'} rel="noreferrer" target="_blank">
                <FontAwesomeIcon icon={getCodeIconByURL(urls[0])} className="icon ml-2 mr-2" />
            </a>
        );
    }
    return (
        <>
            <Button variant="ghost" className="p-0 h-auto min-w-0" onPress={() => setIsOpen(true)}>
                <FontAwesomeIcon icon={faGithub} className="icon ml-2 mr-2" style={{ color: 'var(--accent)' }} />
            </Button>
            <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
                <Modal.Container size="lg">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>
                                <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: id })} className="no-underline">
                                    {title}
                                </Link>
                            </Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <HeroUITable className={tableSlots.base()}>
                                <table className={tableSlots.content()}>
                                    <thead className="table__header">
                                        <tr>
                                            <th className="table__column">Code</th>
                                        </tr>
                                    </thead>
                                    <tbody className="table__body">
                                        {urls?.map((url) => (
                                            <tr key={url} className="table__row">
                                                <td className="table__cell">
                                                    <a href={url ?? '-'} rel="noreferrer" target="_blank" className="text-foreground no-underline">
                                                        <FontAwesomeIcon icon={getCodeIconByURL(url)} className="icon ml-2 mr-2" /> {url}
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </HeroUITable>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </>
    );
};

export default CodeURLsTooltip;
