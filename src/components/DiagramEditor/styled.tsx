import '@xyflow/react/dist/style.css';

import { ReactFlow } from '@xyflow/react';
import styled from 'styled-components';

const StyledReactFlow = styled(ReactFlow)`
    path.react-flow__edge-path {
        stroke-width: 4;
        stroke: ${(props) => props.theme.secondary};
        &:hover {
            stroke: ${(props) => props.theme.primary};
        }
    }
    .react-flow__edge.selected .react-flow__edge-path {
        stroke: ${(props) => props.theme.primary};
    }

    .react-flow__node-group {
        padding: 0;
    }
`;

export default StyledReactFlow;
