import { Position } from '@xyflow/react';
import styled from 'styled-components';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Handle from '@/components/Templates/ShaclFlow/Node/Handle';
import { ENTITIES } from '@/constants/graphSettings';

const TargetClassStyled = styled.div`
    background: ${(props) => props.theme.secondaryDarker};
    color: ${(props) => props.theme.lightLighter};
    border-bottom: 1px solid #000;
`;

type TargetClassProps = {
    data: {
        id: string;
        label: string;
    };
    nodeId: string;
};

function TargetClass({ data, nodeId }: TargetClassProps) {
    return (
        <TargetClassStyled className="py-1 px-2 position-relative">
            <Handle type="target" position={Position.Left} id={nodeId} />
            <div>
                <DescriptionTooltip id={data.id} _class={ENTITIES.CLASS} showURL>
                    {data.label}
                </DescriptionTooltip>
            </div>
        </TargetClassStyled>
    );
}

export default TargetClass;
