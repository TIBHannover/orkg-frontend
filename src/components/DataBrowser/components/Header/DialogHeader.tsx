import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@heroui/react';
import Link from 'next/link';

import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { ENTITIES } from '@/constants/graphSettings';
import { getLinkByEntityType } from '@/utils';

/**
 * Heading for DataBrowserDialog, rendered inside the DataBrowserProvider (via
 * renderAboveHeader) so it follows in-dialog navigation instead of showing the
 * entity the dialog was opened with.
 */
const DialogHeader = () => {
    const { entity } = useEntity();

    if (!entity) {
        return null;
    }

    const typeLabel = entity._class === ENTITIES.PREDICATE ? 'property' : entity._class;
    const link = getLinkByEntityType(entity._class, entity.id);

    return (
        <Modal.Header className="flex flex-row items-center justify-between gap-4 py-4 pr-8">
            <Modal.Heading>
                View existing {typeLabel}: {entity.label || 'No label'}
            </Modal.Heading>
            {link && (
                <Link
                    href={link}
                    title={`Go to ${typeLabel} page`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-sm text-accent hover:underline"
                >
                    Open {typeLabel} <FontAwesomeIcon icon={faExternalLinkAlt} />
                </Link>
            )}
        </Modal.Header>
    );
};

export default DialogHeader;
