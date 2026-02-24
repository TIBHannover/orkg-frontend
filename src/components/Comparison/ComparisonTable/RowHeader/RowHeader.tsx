import { FC, useState } from 'react';

import FilterPopover from '@/components/Comparison/ComparisonTable/RowHeader/FilterPopover/FilterPopover';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Button from '@/components/Ui/Button/Button';
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
            className="tw:!sticky tw:left-0 tw:!border-[#e7eaf1] tw:!border-b tw:bg-inherit tw:!border-r tw:!border-l tw:flex tw:z-10 tw:min-w-[250px] tw:w-[2px] tw:grow-[2] tw:shrink-0 tw:basis-auto"
            scope="row"
            style={{ background: getBackgroundColor(path?.length ? path.length - 1 : 0) }}
        >
            <HierarchyIndicator path={path?.slice(1) ?? []} side="left" showHorizontalLine={false} />

            <div className="tw:flex tw:flex-row tw:items-start tw:justify-between tw:py-1 tw:px-2 tw:w-full">
                <Button
                    onClick={() => setIsOpenDataBrowser(true)}
                    color="link"
                    className="text-start m-0 p-0 text-break user-select-auto tw:!text-[length:inherit] tw:!font-[500] tw:!text-dark tw:!no-underline tw:hover:!underline"
                >
                    <DescriptionTooltip id={row.id} _class={ENTITIES.PREDICATE}>
                        <div>{row.label}</div>
                    </DescriptionTooltip>
                </Button>

                <FilterPopover id={row.id} path={path.slice(0, -1)} />
            </div>
            {isOpenDataBrowser && (
                <DataBrowserDialog show type={ENTITIES.PREDICATE} toggleModal={() => setIsOpenDataBrowser((v) => !v)} id={row.id} label={row.label} />
            )}
        </th>
    );
};

export default RowHeader;
