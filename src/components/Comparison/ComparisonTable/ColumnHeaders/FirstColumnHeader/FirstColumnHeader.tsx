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
        <div className="tw:bg-secondary tw:text-white tw:h-full tw:rounded-tl-md tw:ps-3 tw:py-2 tw:flex tw:flex-col tw:justify-between tw:items-start">
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
