import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import Button from '@/components/Ui/Button/Button';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

type DataBrowserDialogProps = {
    isEditMode?: boolean;
    id: string;
    label: string;
    type?: string;
    show: boolean;
    defaultHistory?: string[];
    toggleModal: () => void;
    onCloseModal?: () => void;
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
}) => {
    let route = ROUTES.RESOURCE;
    switch (type) {
        case ENTITIES.PREDICATE:
            route = ROUTES.PROPERTY;
            break;
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

    let rootId = id;

    if (defaultHistory && defaultHistory.length > 0) {
        [rootId] = defaultHistory;
    }

    return (
        <Modal
            isOpen={show}
            toggle={toggleModal}
            size="xl"
            onExit={() => {
                onCloseModal?.();
            }}
        >
            <ModalHeader toggle={toggleModal}>
                <span style={{ marginRight: 170, display: 'inline-block' }}>
                    View existing {type === ENTITIES.PREDICATE ? 'property' : type}: {label}
                </span>
                <Link
                    style={{ right: 45, position: 'absolute', top: 12 }}
                    title={`Go to ${type} page`}
                    className="ms-2"
                    href={`${reverse(route, { id })}?noRedirect`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button color="link" className="p-0">
                        Open {type} <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                    </Button>
                </Link>
            </ModalHeader>
            <ModalBody>
                <DataBrowser isEditMode={isEditMode} key={rootId} id={rootId} canEditSharedRootLevel defaultHistory={defaultHistory} />
            </ModalBody>
        </Modal>
    );
};
export default DataBrowserDialog;
