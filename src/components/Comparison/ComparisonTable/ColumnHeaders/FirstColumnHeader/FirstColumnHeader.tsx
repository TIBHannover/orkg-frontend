import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';

import useManagePropertiesModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/hooks/useManagePropertiesModal';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Tooltip from '@/components/FloatingUI/Tooltip';

const FirstColumnHeader = () => {
    const { openManageProperties } = useManagePropertiesModal();
    const { isValidatingComparisonContents, isEditMode } = useComparison();

    return (
        <div className="bg-secondary-solid text-white h-full rounded-tl-md ps-3 py-2 flex flex-col justify-between items-start">
            <div>
                Properties{' '}
                {isValidatingComparisonContents && (
                    <Tooltip content="Comparison content is reloading">
                        <FontAwesomeIcon icon={faSpinner} spin />
                    </Tooltip>
                )}
            </div>
            {isEditMode && (
                <Button size="sm" onPress={openManageProperties}>
                    Manage properties
                </Button>
            )}
        </div>
    );
};

export default FirstColumnHeader;
