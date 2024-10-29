import { faPen, faRotateLeft, faTable } from '@fortawesome/free-solid-svg-icons';
import ActionButton from 'components/ActionButton/ActionButton';
import InfoTippy from 'components/DataBrowser/components/Body/ValueOptions/InfoTippy';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import { FC } from 'react';
import { Statement } from 'services/backend/types';

type ValueOptionsProps = {
    path: string[];
    statement: Statement;
    toggleEditValue?: () => void;
    showPreview: () => void;
};

const ValueOptions: FC<ValueOptionsProps> = ({ path, statement, toggleEditValue, showPreview }) => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { canEdit } = useCanEdit();
    const dispatch = useDataBrowserDispatch();

    const highlightLoop = () => {
        dispatch({ type: 'HIGHLIGHT_CYCLE', payload: statement.object.id });
    };

    return (
        <div className="ms-2 d-inline-block">
            {'classes' in statement.object &&
                (statement.object.classes?.includes(CLASSES.QB_DATASET_CLASS) || statement.object.classes?.includes(CLASSES.CSVW_TABLE)) && (
                    <ActionButton appendTo={document.body} title="Visualize data in tabular form" icon={faTable} action={() => showPreview()} />
                )}

            {path.includes(statement.object.id) && !isEditMode && <ActionButton title="Cycle" icon={faRotateLeft} action={highlightLoop} />}
            <div className=" d-inline-block actionButtons">
                {canEdit && isEditMode && statement.object._class === ENTITIES.LITERAL && (
                    <ActionButton title="Edit value" testId={statement.object.id} icon={faPen} action={toggleEditValue} />
                )}
                <InfoTippy statement={statement} />
            </div>
        </div>
    );
};
export default ValueOptions;
