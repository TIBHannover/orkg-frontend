import { cn, Modal } from '@heroui/react';
import { Dispatch, FC, ReactNode, SetStateAction } from 'react';

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

const InputFieldModal: FC<InputFieldModalProps> = ({ isOpen, setIsOpen, children, dataType, inputValue, className }) => {
    const datatype = getConfigByType(dataType);

    return (
        <div className={cn('flex flex-1 min-w-0 items-center border border-border bg-background px-2 min-h-9 rounded-[var(--radius)]', className)}>
            <Modal.Backdrop className="z-[1055]" isOpen={isOpen} onOpenChange={setIsOpen} isDismissable>
                <Modal.Container>
                    <Modal.Dialog>
                        <Modal.Header>
                            <Modal.CloseTrigger />
                            <Modal.Heading>{datatype.name}</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body className="px-0.5 pb-0.5">{children}</Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
            <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsOpen(true)}
                onClick={() => setIsOpen(true)}
                className="grow cursor-pointer truncate text-sm"
            >
                <ValuePlugins type={ENTITIES.LITERAL} datatype={dataType}>
                    {inputValue || `Enter a ${datatype.name}`}
                </ValuePlugins>
            </div>
        </div>
    );
};

export default InputFieldModal;
