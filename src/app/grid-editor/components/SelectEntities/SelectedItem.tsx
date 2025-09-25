import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, SetStateAction } from 'react';

import usePaperContributionCheck from '@/app/grid-editor/hooks/usePaperContributionCheck';
import Button from '@/components/Ui/Button/Button';
import { Thing } from '@/services/backend/things';

const SelectedItem = ({ entity, setSelectedEntities }: { entity: Thing; setSelectedEntities: Dispatch<SetStateAction<Thing[]>> }) => {
    const { paper } = usePaperContributionCheck(entity.id);

    return (
        <div key={entity.id} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:bg-gray-50 tw:rounded-lg tw:border tw:border-gray-200">
            <div className="tw:flex-1">
                <div className="tw:flex tw:items-center tw:gap-2">
                    <div className="tw:font-medium tw:text-gray-900">{paper?.title ?? entity.label}</div>
                </div>
                {paper && <div className="tw:text-xs tw:text-gray-500 tw:mt-1">{entity.label}</div>}
                {entity.id && <div className="tw:text-xs tw:text-gray-500 tw:mt-1">ID: {entity.id}</div>}
            </div>
            <Button
                color="light"
                size="sm"
                className="tw:ml-3"
                onClick={() => {
                    setSelectedEntities((prev) => prev.filter((e) => e.id !== entity.id));
                }}
                title="Remove selected entity"
            >
                <FontAwesomeIcon icon={faXmark} />
            </Button>
        </div>
    );
};

export default SelectedItem;
