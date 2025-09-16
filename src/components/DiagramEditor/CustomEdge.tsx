import { EdgeLabelRenderer, getSmoothStepPath, Position } from '@xyflow/react';
import { FC } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { ENTITIES } from '@/constants/graphSettings';
import { Resource } from '@/services/backend/types';

const getMarkerEnd = (arrowHeadType: string, markerEndId: string) => {
    if (typeof markerEndId !== 'undefined' && markerEndId) {
        return `url(#${markerEndId})`;
    }

    // return typeof arrowHeadType !== 'undefined' ? `url(#react-flow__${arrowHeadType})` : 'none';
    return typeof arrowHeadType !== 'undefined' ? `url(#type=${arrowHeadType})` : 'none';
};

type CustomEdgeProps = {
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    style: React.CSSProperties;
    arrowHeadType: string;
    markerEndId: string;
    data: Resource & { linked?: boolean };
    borderRadius: number;
};
const CustomEdge: FC<CustomEdgeProps> = ({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    arrowHeadType = 'arrow',
    markerEndId,
    data,
    borderRadius = 5,
}) => {
    const [path, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius,
    });

    const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

    return (
        <>
            <path style={style} className="react-flow__edge-path" d={path} markerEnd={markerEnd} />

            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -100%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        zIndex: 10,
                    }}
                    className="nodrag nopan"
                >
                    <ConditionalWrapper
                        condition={data?.linked}
                        // eslint-disable-next-line react/no-unstable-nested-components
                        wrapper={(children: React.ReactNode) => (
                            <DescriptionTooltip _class={ENTITIES.PREDICATE} id={data?.id}>
                                {children}
                            </DescriptionTooltip>
                        )}
                    >
                        {data?.label}
                    </ConditionalWrapper>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;
