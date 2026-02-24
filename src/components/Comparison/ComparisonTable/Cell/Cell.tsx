import { isEqual } from 'lodash';
import { memo, useState } from 'react';

import CellLiteral from '@/components/Comparison/ComparisonTable/Cell/CellLiteral/CellLiteral';
import useComparison from '@/components/Comparison/hooks/useComparison';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { ThingReference } from '@/services/backend/types';

export const classToType = {
    resource_ref: ENTITIES.RESOURCE,
    predicate_ref: ENTITIES.PREDICATE,
    literal_ref: ENTITIES.LITERAL,
    class_ref: ENTITIES.CLASS,
};

type CellProps = {
    value?: ThingReference;
    path?: string[];
    dataBrowserHistory?: string[];
};

const Cell = ({ value, path, dataBrowserHistory }: CellProps) => {
    const [isOpenDataBrowserModal, setIsOpenDataBrowserModal] = useState(false);
    const { selectedPathsFlattened, comparisonContents, mutateComparisonContents, isEditMode } = useComparison();
    return (
        <>
            <div
                className="tw:flex tw:h-full tw:!border-b-[#e7eaf1] tw:!border-b tw:bg-inherit tw:!border-r tw:!border-r-[#e7eaf1] tw:break-all"
                style={{ background: getBackgroundColor(path?.length ? path.length - 1 : 0) }}
            >
                {value ? (
                    <div className="tw:py-1 tw:px-2">
                        {value._class !== 'literal_ref' && (
                            <span>
                                <DescriptionTooltip
                                    id={value.id}
                                    _class={classToType[value._class]}
                                    classes={'classes' in value ? value.classes : undefined}
                                >
                                    <div
                                        className="btn-link tw:!text-primary"
                                        onClick={() => setIsOpenDataBrowserModal(true)}
                                        style={{ cursor: 'pointer' }}
                                        onKeyDown={(e) => (e.key === 'Enter' ? setIsOpenDataBrowserModal(true) : undefined)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <ValuePlugins type="resource">{value.label}</ValuePlugins>
                                    </div>
                                </DescriptionTooltip>
                            </span>
                        )}
                        {value._class === 'literal_ref' ? <CellLiteral literal={value} /> : null}
                    </div>
                ) : null}
            </div>

            <DataBrowserDialog
                show={isOpenDataBrowserModal}
                toggleModal={() => setIsOpenDataBrowserModal((v) => !v)}
                id={value?.id ?? ''}
                label={value?.label ?? ''}
                type={classToType[value?._class ?? 'literal_ref']}
                comparisonSelectedPaths={selectedPathsFlattened.map((selectedPath) => [...(selectedPath.path ?? []), selectedPath.id])}
                isEditMode={isEditMode}
                defaultHistory={dataBrowserHistory}
                onCloseModal={() => isEditMode && mutateComparisonContents(comparisonContents, { revalidate: true })}
            />
        </>
    );
};

export default memo(Cell, isEqual);
