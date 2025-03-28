import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { range } from 'lodash';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import PredicateView from '@/components/DataBrowser/components/Body/PredicateView/PredicateView';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import { StatementWrapperStyled } from '@/components/DataBrowser/styles/styled';
import { Statement } from '@/services/backend/types';

type TriplePredicateProps = {
    level: number;
    statement: Statement;
    deleteStatement: () => void;
};

const TriplePredicate: FC<TriplePredicateProps> = ({ level, statement, deleteStatement }) => {
    const [isFocused, setIsFocused] = useState(false);
    const { config } = useDataBrowserState();

    const { isEditMode } = config;

    const { canEdit } = useCanEdit();

    return (
        <>
            {level > 0 && <HierarchyIndicator path={range(level).map((c) => c.toString())} side="left" />}
            <StatementWrapperStyled className="px-2 py-1 d-flex align-items-center flex-grow-1">
                <PredicateView predicate={statement.predicate} />{' '}
                {canEdit && isEditMode && (
                    <span className={`ms-1 ${!isFocused && 'actionButtons'}`}>
                        <ActionButton
                            open={isFocused}
                            setOpen={setIsFocused}
                            title="Delete statement"
                            icon={faTrash}
                            requireConfirmation
                            confirmationMessage="Are you sure?"
                            confirmationButtons={[
                                {
                                    title: 'Delete',
                                    color: 'danger',
                                    icon: faCheck,
                                    action: deleteStatement,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    </span>
                )}
            </StatementWrapperStyled>
        </>
    );
};

export default TriplePredicate;
