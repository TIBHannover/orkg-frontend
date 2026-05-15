import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { FC } from 'react';

// Inline stroke so html-to-image's PNG export sees a color on the cloned <path>;
// the default xyflow stylesheet sets stroke via a CSS variable that doesn't
// survive the DOM clone, leaving edges invisible in the downloaded image.
const EDGE_STROKE = '#b1b1b7';
const EDGE_STROKE_WIDTH = 3;

const CustomEdge: FC<EdgeProps> = ({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, style }) => {
    const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return <BaseEdge path={path} markerEnd={markerEnd} style={{ stroke: EDGE_STROKE, strokeWidth: EDGE_STROKE_WIDTH, ...style }} />;
};

export default CustomEdge;
