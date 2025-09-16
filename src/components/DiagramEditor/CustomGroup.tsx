import { Handle, Position } from '@xyflow/react';
import { FC } from 'react';
import styled from 'styled-components';

import { Resource } from '@/services/backend/types';

const StyledGroupHeader = styled.div`
    background: rgba(128, 134, 155, 0.8);
    color: #fff;
    min-height: 20px;
`;
type CustomGroupProps = {
    data: Resource;
};
const CustomGroup: FC<CustomGroupProps> = ({ data }) => {
    return (
        <>
            <StyledGroupHeader>{data.label}</StyledGroupHeader>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};

export default CustomGroup;
