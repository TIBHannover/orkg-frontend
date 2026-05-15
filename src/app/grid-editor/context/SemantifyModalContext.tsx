import { createContext, FC, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import SemantifyButtonModal from '@/components/SemantifyButton/SemantifyButtonModal';
import { Statement, Template } from '@/services/backend/types';

type SemantifyArgs = {
    statement: Statement;
    templates?: Template[];
    currentPathStatements?: Statement[];
    onSave: (deletedStatementIds: string[], newStatementIds: string[]) => void;
};

type SemantifyModalContextValue = {
    openModal: (args: SemantifyArgs) => void;
    closeModal: () => void;
};

const SemantifyModalContext = createContext<SemantifyModalContextValue | null>(null);

export const useSemantifyModal = () => {
    const ctx = useContext(SemantifyModalContext);
    if (!ctx) {
        throw new Error('useSemantifyModal must be used within a SemantifyModalProvider');
    }
    return ctx;
};

type SemantifyModalProviderProps = {
    children: ReactNode;
};

const SemantifyModalProvider: FC<SemantifyModalProviderProps> = ({ children }) => {
    const [args, setArgs] = useState<SemantifyArgs | null>(null);

    const openModal = useCallback((next: SemantifyArgs) => setArgs(next), []);
    const closeModal = useCallback(() => setArgs(null), []);

    const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

    return (
        <SemantifyModalContext.Provider value={value}>
            {children}
            {args !== null && (
                <SemantifyButtonModal
                    isModalOpen
                    toggleModal={closeModal}
                    statement={args.statement}
                    templates={args.templates}
                    currentPathStatements={args.currentPathStatements}
                    onSave={args.onSave}
                />
            )}
        </SemantifyModalContext.Provider>
    );
};

export default SemantifyModalProvider;
