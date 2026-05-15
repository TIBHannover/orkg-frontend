import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import TablePathsModal from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/TablePathsModal';
import useComparison from '@/components/Comparison/hooks/useComparison';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';

const FirstColumnHeader = () => {
    const [isOpenManagePropertiesModal, setIsOpenManagePropertiesModal] = useState(false);
    const { isValidatingComparisonContents, isEditMode } = useComparison();

    return (
        <div className="bg-secondary text-white h-full rounded-tl-md ps-3 py-2 flex flex-col justify-between items-start">
            <div>
                Properties{' '}
                {isValidatingComparisonContents && (
                    <Tooltip content="Comparison content is reloading">
                        <FontAwesomeIcon icon={faSpinner} spin />
                    </Tooltip>
                )}
            </div>
            {isEditMode && (
                <Button color="secondary-darker" size="sm" onClick={() => setIsOpenManagePropertiesModal(true)}>
                    Manage properties
                </Button>
            )}
            {isOpenManagePropertiesModal && <TablePathsModal toggle={() => setIsOpenManagePropertiesModal((v) => !v)} />}
        </div>
    );
};

export default FirstColumnHeader;
