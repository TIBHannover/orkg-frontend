import { faPen, faRotateLeft, faSitemap, faTable } from '@fortawesome/free-solid-svg-icons';
import { isEqual } from 'lodash';
import { FC, useCallback } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import InfoTippy from '@/components/DataBrowser/components/Body/ValueOptions/InfoTippy';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import { hasValuePreview } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { ENTITIES } from '@/constants/graphSettings';
import { Statement } from '@/services/backend/types';

type ValueOptionsProps = {
    path: string[];
    statement: Statement;
    toggleEditValue?: () => void;
    showPreview: () => void;
    isPreviewVisible: boolean;
    hasObjectStatements: boolean;
};

const ValueOptions: FC<ValueOptionsProps> = ({ path, statement, toggleEditValue, showPreview, isPreviewVisible, hasObjectStatements }) => {
    const { config, loadedResources } = useDataBrowserState();
    const { isEditMode, valuesAsLinks } = config;
    const { canEdit } = useCanEdit();

    const scrollToElement = useCallback(() => {
        const element = document.getElementById(statement.object.id);
        if (element) {
            window.location.hash = statement.object.id;
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [statement.object.id]);

    return (
        <div className="ml-2 inline-flex items-center gap-0.5 align-middle">
            {!valuesAsLinks && hasValuePreview(statement.object) && (
                <ActionButton
                    title={isPreviewVisible ? 'Hide tabular form' : 'Visualize data in tabular form'}
                    icon={faTable}
                    isActive={isPreviewVisible}
                    action={() => showPreview()}
                />
            )}
            {path.includes(statement.object.id) && !isEditMode && hasObjectStatements && (
                <ActionButton title="Cycle" icon={faRotateLeft} action={scrollToElement} />
            )}
            {hasObjectStatements &&
                statement.object._class !== ENTITIES.LITERAL &&
                !path.includes(statement.object.id) &&
                !isEqual(loadedResources[statement.object.id], path) && (
                    <ActionButton
                        title={`Expended in the following path: ${loadedResources[statement.object.id]?.join(' > ')}`}
                        icon={faSitemap}
                        action={scrollToElement}
                    />
                )}
            <div className="inline-flex items-center gap-0.5 actionButtons">
                {canEdit && isEditMode && statement.object._class === ENTITIES.LITERAL && (
                    <ActionButton title="Edit value" testId={statement.object.id} icon={faPen} action={toggleEditValue} />
                )}
                <InfoTippy statement={statement} />
            </div>
        </div>
    );
};
export default ValueOptions;
