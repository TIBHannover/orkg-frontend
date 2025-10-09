import { ICellRendererParams } from 'ag-grid-community';
import { env } from 'next-runtime-env';
import { useState } from 'react';

import CellMenu from '@/app/grid-editor/components/CellMenu/CellMenu';
import { TData } from '@/app/grid-editor/context/GridContext';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Button from '@/components/Ui/Button/Button';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { EntityType } from '@/services/backend/types';

type ValueCellParams = ICellRendererParams<TData>;

const ValueCell = (params: ValueCellParams) => {
    const { value, api } = params;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    if (!value || !value.object) {
        return <div />;
    }

    if (value.object._class === ENTITIES.LITERAL) {
        return (
            <div
                role="textbox"
                className="tw:group tw:flex tw:items-start tw:gap-2 tw:relative tw:pr-6 tw:w-full tw:h-full tw:cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                tabIndex={0}
            >
                <div className="tw:min-w-0 tw:flex-1 tw:line-clamp-3">
                    {value.object.label ? (
                        <ValuePlugins type={value.object._class} options={{ isModal: true }} datatype={value.object.datatype}>
                            {value.object.label}
                        </ValuePlugins>
                    ) : (
                        <i>No label</i>
                    )}
                </div>
                {api.getEditingCells().length === 0 && <CellMenu {...params} isHovered={isHovered} />}
            </div>
        );
    }
    return (
        <div
            className="tw:group tw:flex tw:items-start tw:gap-2 tw:relative tw:pr-6 tw:w-full tw:h-full tw:cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <DescriptionTooltip id={value.object.id} _class={value.object._class as EntityType}>
                <Button
                    color="link"
                    className="p-0 text-wrap text-start tw:!text-[length:inherit]"
                    style={{ maxWidth: '100%' }}
                    onClick={() => setIsModalOpen(true)}
                >
                    <span className="tw:line-clamp-3">
                        {('formatted_label' in value.object && value.object.formatted_label) || value.object.label || <i>No label</i>}
                    </span>
                </Button>
            </DescriptionTooltip>
            {api.getEditingCells().length === 0 && <CellMenu {...params} isHovered={isHovered} />}
            {isModalOpen && (
                <DataBrowserDialog
                    show
                    toggleModal={() => setIsModalOpen(!isModalOpen)}
                    id={value.object.id}
                    label={value.object.label}
                    isEditMode={env('NEXT_PUBLIC_PWC_USER_ID') !== value.object.created_by ? true : undefined}
                />
            )}
        </div>
    );
};

export default ValueCell;
