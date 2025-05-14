import { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { getConfigByType } from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';

type InputFieldModalProps = {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    children: ReactNode;
    dataType: string;
    inputValue: string;
    className?: string;
};

const InputFieldModal: FC<InputFieldModalProps> = ({ isOpen, setIsOpen, children, dataType, inputValue, className = 'd-flex flex-grow-1 ' }) => {
    const datatype = getConfigByType(dataType);

    return (
        <div className={`input-group-text bg-white ${className}`} style={{ overflow: 'hidden', verticalAlign: 'middle' }}>
            <Modal isOpen={isOpen} toggle={() => setIsOpen(!isOpen)}>
                <ModalHeader toggle={() => setIsOpen(!isOpen)}>{datatype.name}</ModalHeader>
                <ModalBody>{children}</ModalBody>
            </Modal>
            <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                className="flex-grow-1 d-flex border-0 radius-0"
            >
                <ValuePlugins type={ENTITIES.LITERAL} datatype={dataType}>
                    {inputValue || `Enter a ${datatype.name}`}
                </ValuePlugins>
            </div>
        </div>
    );
};

export default InputFieldModal;
