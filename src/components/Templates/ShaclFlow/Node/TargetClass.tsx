import { Position } from '@xyflow/react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Handle from '@/components/Templates/ShaclFlow/Node/Handle';
import { ENTITIES } from '@/constants/graphSettings';

type TargetClassProps = {
    data: {
        id: string;
        label: string;
    };
    nodeId: string;
};

function TargetClass({ data, nodeId }: TargetClassProps) {
    return (
        <div className="bg-secondary-darker text-surface border-b border-border py-1 px-2 relative">
            <Handle type="target" position={Position.Left} id={nodeId} />
            <div>
                <DescriptionTooltip id={data.id} _class={ENTITIES.CLASS} showURL>
                    {data.label}
                </DescriptionTooltip>
            </div>
        </div>
    );
}

export default TargetClass;
