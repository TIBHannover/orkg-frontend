import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';

import { useGridDispatch } from '@/app/grid-editor/context/GridContext';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { ENTITIES } from '@/constants/graphSettings';
import { Predicate, Template } from '@/services/backend/types';

type AllPropertiesModalProps = {
    isOpen: boolean;
    toggle: () => void;
    template: Template;
    properties: Predicate[];
};

const AllPropertiesModal: FC<AllPropertiesModalProps> = ({ isOpen, toggle, template, properties }) => {
    const dispatch = useGridDispatch();

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>
                <div className="tw:flex tw:items-center tw:justify-between tw:w-full">
                    <span>
                        All properties for {template.label} ({properties.length})
                    </span>
                </div>
            </ModalHeader>
            <ModalBody>
                <div className="tw:bg-white tw:border tw:border-gray-200 tw:rounded-lg tw:shadow-sm tw:overflow-hidden">
                    <div className="tw:divide-y tw:divide-gray-100">
                        {properties.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                className="tw:w-full tw:text-left tw:px-4 tw:py-3 tw:cursor-pointer tw:hover:bg-gray-50 tw:transition-colors tw:duration-150 tw:border-0 tw:bg-transparent"
                                onClick={() => {
                                    dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p } });
                                }}
                            >
                                <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE}>
                                    <div className="tw:flex tw:items-center">
                                        <FontAwesomeIcon icon={faPlus} className="tw:text-gray-400 tw:mr-3 tw:text-sm" />
                                        <span className="tw:text-base tw:text-gray-700">{p.label}</span>
                                    </div>
                                </DescriptionTooltip>
                            </button>
                        ))}
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default AllPropertiesModal;
