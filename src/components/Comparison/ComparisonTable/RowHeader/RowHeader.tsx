import { FC, useState } from 'react';

import FilterPopover from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/FilterPopover';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { ComparisonPath } from '@/services/backend/types';

type RowHeaderProps = {
    row?: ComparisonPath;
    path: string[];
};

const RowHeader: FC<RowHeaderProps> = ({ row, path }) => {
    const [isOpenDataBrowser, setIsOpenDataBrowser] = useState(false);

    if (!row) {
        return null;
    }

    return (
        <th
            className="sticky left-0 border-[#e7eaf1] border-b bg-inherit border-r border-l flex z-10 min-w-[250px] w-[2px] grow-[2] shrink-0 basis-auto"
            scope="row"
            style={{ background: getBackgroundColor(path?.length ? path.length - 1 : 0) }}
        >
            <HierarchyIndicator path={path?.slice(1) ?? []} side="left" showHorizontalLine={false} />
            <div className="flex flex-row items-start justify-between py-1.5 px-3 w-full">
                <DescriptionTooltip id={row.id} _class={ENTITIES.PREDICATE}>
                    <button
                        type="button"
                        onClick={() => setIsOpenDataBrowser(true)}
                        className="text-left text-dark hover:underline cursor-pointer break-words"
                        style={{ fontWeight: 500 }}
                    >
                        {row.label}
                    </button>
                </DescriptionTooltip>

                <FilterPopover id={row.id} path={path.slice(0, -1)} />
            </div>
            {isOpenDataBrowser && (
                <DataBrowserDialog show type={ENTITIES.PREDICATE} toggleModal={() => setIsOpenDataBrowser((v) => !v)} id={row.id} label={row.label} />
            )}
        </th>
    );
};

export default RowHeader;
