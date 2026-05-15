import { ICellRendererParams } from 'ag-grid-community';
import { env } from 'next-runtime-env';
import { useState } from 'react';

import CellMenu from '@/app/grid-editor/components/CellMenu/CellMenu';
import { TData } from '@/app/grid-editor/context/GridContext';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { EntityType } from '@/services/backend/types';

type ValueCellParams = ICellRendererParams<TData>;

const EntityTypeBadge = ({ children }: { children: React.ReactNode }) => (
    <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold border mr-[3px] align-middle"
        style={{
            background: 'var(--color-secondary)',
            borderColor: 'var(--color-secondary-darker)',
        }}
    >
        {children}
    </span>
);

const ValueCell = (params: ValueCellParams) => {
    const { value, api } = params;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { user } = useAuthentication();
    const isCurationAllowed = user?.isCurationAllowed ?? false;
    if (!value || !value.object) {
        return <div />;
    }

    if (value.object._class === ENTITIES.LITERAL) {
        return (
            <div
                role="textbox"
                className="group flex items-start gap-2 relative pr-6 w-full h-full cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                tabIndex={0}
            >
                <div className="min-w-0 flex-1 line-clamp-3">
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

    const label = ('formatted_label' in value.object && value.object.formatted_label) || value.object.label;

    return (
        <div
            className="group flex items-start gap-2 relative pr-6 w-full h-full cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="min-w-0 flex-1 break-all overflow-x-auto overflow-y-hidden">
                <DescriptionTooltip id={value.object.id} _class={value.object._class as EntityType}>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="p-0 bg-transparent border-0 text-accent hover:underline underline-offset-2 text-left select-text cursor-pointer max-w-full"
                    >
                        <span className="line-clamp-3">
                            {value.object._class === ENTITIES.CLASS && <EntityTypeBadge>C</EntityTypeBadge>}
                            {value.object._class === ENTITIES.PREDICATE && <EntityTypeBadge>P</EntityTypeBadge>}
                            {label || <i>No label</i>}
                        </span>
                    </button>
                </DescriptionTooltip>
            </div>
            {api.getEditingCells().length === 0 && <CellMenu {...params} isHovered={isHovered} />}
            {isModalOpen && (
                <DataBrowserDialog
                    show
                    toggleModal={() => setIsModalOpen(!isModalOpen)}
                    id={value.object.id}
                    label={value.object.label}
                    isEditMode={
                        !(
                            env('NEXT_PUBLIC_PWC_USER_ID') === value.object.created_by ||
                            (value.object.classes.includes(CLASSES.RESEARCH_FIELD) && !isCurationAllowed)
                        )
                    }
                    showFooter={!value.object.classes?.includes(CLASSES.CSVW_TABLE)}
                />
            )}
        </div>
    );
};

export default ValueCell;
