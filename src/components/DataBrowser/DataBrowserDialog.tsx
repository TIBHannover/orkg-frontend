import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type DataBrowserDialogProps = {
    isEditMode?: boolean;
    id: string;
    label: string;
    type?: string;
    show: boolean;
    defaultHistory?: string[];
    toggleModal: () => void;
    onCloseModal?: () => void;
    showFooter?: boolean;
    comparisonSelectedPaths?: string[][];
};

const DataBrowserDialog: FC<DataBrowserDialogProps> = ({
    isEditMode = false,
    label,
    id,
    show,
    defaultHistory,
    toggleModal,
    onCloseModal,
    type = ENTITIES.RESOURCE,
    showFooter = true,
    comparisonSelectedPaths,
}) => {
    let route = ROUTES.RESOURCE;
    switch (type) {
        case ENTITIES.PREDICATE:
        case 'property':
            route = ROUTES.PROPERTY;
            break;
        case ENTITIES.CLASS:
            route = ROUTES.CLASS;
            break;
        default:
            route = ROUTES.RESOURCE;
            break;
    }

    const typeLabel = type === ENTITIES.PREDICATE ? 'property' : type;

    let rootId = id;
    if (defaultHistory && defaultHistory.length > 0) {
        [rootId] = defaultHistory;
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggleModal();
            onCloseModal?.();
        }
    };

    return (
        <Modal.Backdrop isOpen={show} onOpenChange={handleOpenChange} className="z-[1055]">
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-6xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <div className="flex items-center justify-between gap-4 pr-8">
                            <Modal.Heading>
                                View existing {typeLabel}: {label}
                            </Modal.Heading>
                            <Link
                                href={`${reverse(route, { id })}?noRedirect`}
                                title={`Go to ${typeLabel} page`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whitespace-nowrap text-sm text-accent hover:underline"
                            >
                                Open {typeLabel} <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </Link>
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        {show && (
                            <DataBrowser
                                isEditMode={isEditMode}
                                key={rootId}
                                id={rootId}
                                canEditSharedRootLevel
                                defaultHistory={defaultHistory}
                                showFooter={showFooter}
                                comparisonSelectedPaths={comparisonSelectedPaths}
                            />
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default DataBrowserDialog;
