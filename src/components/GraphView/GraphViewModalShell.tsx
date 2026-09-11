'use client';

import { Modal } from '@heroui/react';
import { ReactNode } from 'react';

type GraphViewModalShellProps = {
    toggle: () => void;
    children: ReactNode;
};

/** Modal geometry shared by the graph view and its lazy-loading fallback. */
const GraphViewModalShell = ({ toggle, children }: GraphViewModalShellProps) => (
    // z-[1055] keeps the backdrop above the fixed page header
    <Modal.Backdrop
        isOpen
        className="z-[1055]"
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                toggle();
            }
        }}
    >
        <Modal.Container size="cover" className="sm:w-full sm:max-w-[90%]">
            <Modal.Dialog className="overflow-hidden p-0">{children}</Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default GraphViewModalShell;
