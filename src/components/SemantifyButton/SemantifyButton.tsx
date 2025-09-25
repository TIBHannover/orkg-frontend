import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import SemantifyButtonModal from '@/components/SemantifyButton/SemantifyButtonModal';
import { Statement, Template } from '@/services/backend/types';

type SemantifyButtonProps = {
    statement: Statement;
    title: string;
    isDisabled: boolean;
    onSave: (deletedStatementIds: string[], newStatementIds: string[]) => void;
    templates?: Template[];
    currentPathStatements?: Statement[];
};

const SemantifyButton: FC<SemantifyButtonProps> = ({ statement, title, isDisabled, onSave, templates, currentPathStatements }) => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <>
            <ActionButton title={title} icon={faWandMagicSparkles} isDisabled={isDisabled} action={toggleModal} iconSize="xs" />

            {isModalOpen && (
                <SemantifyButtonModal
                    currentPathStatements={currentPathStatements}
                    isModalOpen={isModalOpen}
                    toggleModal={toggleModal}
                    statement={statement}
                    templates={templates}
                    onSave={onSave}
                />
            )}
        </>
    );
};

export default SemantifyButton;
