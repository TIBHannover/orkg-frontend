import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FC } from 'react';

import { useSemantifyModal } from '@/app/grid-editor/context/SemantifyModalContext';
import ActionButton from '@/components/ActionButton/ActionButton';
import { Statement, Template } from '@/services/backend/types';

type SemantifyButtonProps = {
    statement: Statement;
    title: string;
    isDisabled: boolean;
    onSave: (deletedStatementIds: string[], newStatementIds: string[]) => void;
    templates?: Template[];
    currentPathStatements?: Statement[];
    onOpen?: () => void;
};

const SemantifyButton: FC<SemantifyButtonProps> = ({ statement, title, isDisabled, onSave, templates, currentPathStatements, onOpen }) => {
    const { openModal } = useSemantifyModal();

    const handleOpen = () => {
        onOpen?.();
        openModal({ statement, templates, currentPathStatements, onSave });
    };

    return <ActionButton title={title} icon={faWandMagicSparkles} isDisabled={isDisabled} action={handleOpen} iconSize="xs" />;
};

export default SemantifyButton;
