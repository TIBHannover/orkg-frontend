import { Position } from '@xyflow/react';
import { FC } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Handle from '@/components/Templates/ShaclFlow/Node/Handle';
import DATA_TYPES from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import { PropertyShape } from '@/services/backend/types';

type PropertyShapeProps = {
    data: PropertyShape;
    nodeId: string;
};

const PropertyShapeComponent: FC<PropertyShapeProps> = ({ data, nodeId }) => {
    let initialType;
    let range;
    if ('class' in data) {
        range = data.class;
    } else if ('datatype' in data) {
        range = data.datatype;
    }
    if (range?.id) {
        if (
            DATA_TYPES.filter((dt) => dt._class === ENTITIES.LITERAL)
                .map((t) => t.classId)
                .includes(range.id)
        ) {
            initialType = 'L';
        } else {
            initialType = 'C';
        }
    } else {
        initialType = null;
    }

    return (
        <div className="bg-background text-secondary-darker border-b border-border last:border-b-0 py-1 px-2 relative">
            {initialType === 'C' && <Handle id={data.path.id} type="source" position={Position.Right} />}
            <div className="flex">
                <div className="grow mr-2 flex">
                    <DescriptionTooltip
                        id={data.path.id}
                        _class={ENTITIES.PREDICATE}
                        showURL
                        extraContent={
                            data.path.label?.length > 40 ? (
                                <>
                                    <hr className="my-1.5 border-border" />
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-muted shrink-0">Label</span>
                                        <span>{data.path.label}</span>
                                    </div>
                                </>
                            ) : undefined
                        }
                    >
                        <span className="truncate inline-block mr-1 max-w-[300px]">{data.path.label}</span>
                    </DescriptionTooltip>{' '}
                    [{data.min_count}..{data.max_count ?? '*'}]
                </div>
                {initialType && range && (
                    <DescriptionTooltip id={range.id} _class={ENTITIES.CLASS} showURL>
                        <span className="w-[22px] h-[22px] rounded-full bg-secondary-darker text-white text-center text-xs leading-[22px] inline-block shrink-0">
                            {initialType}
                        </span>
                    </DescriptionTooltip>
                )}
            </div>
        </div>
    );
};

export default PropertyShapeComponent;
