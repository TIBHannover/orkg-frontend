import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Dispatch, SetStateAction } from 'react';

import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import ActionButton from '@/components/ActionButton/ActionButton';
import { Thing } from '@/services/backend/things';
import { ResourceThingReference } from '@/services/backend/types';

const SelectedItem = ({
    entity,
    setSelectedEntities,
}: {
    entity: Thing | ResourceThingReference;
    setSelectedEntities: Dispatch<SetStateAction<(Thing | ResourceThingReference)[]>>;
}) => {
    const { paper } = usePaperContributionCheck(entity.id);

    return (
        <div key={entity.id} className="flex items-center justify-between p-3 bg-default rounded-lg border border-default">
            <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{paper?.title ?? entity.label}</div>
                {paper && <div className="text-xs text-gray-500 mt-1 truncate">{entity.label}</div>}
                {entity.id && <div className="text-xs text-gray-500 mt-1">ID: {entity.id}</div>}
            </div>
            <div className="ml-3 shrink-0">
                <ActionButton
                    title="Remove selected entity"
                    icon={faXmark}
                    action={() => {
                        setSelectedEntities((prev) => prev.filter((e) => e.id !== entity.id));
                    }}
                />
            </div>
        </div>
    );
};

export default SelectedItem;
