import { FC } from 'react';

import NodeFooter from '@/components/Templates/ShaclFlow/Node/NodeFooter';
import NodeHeader from '@/components/Templates/ShaclFlow/Node/NodeHeader';
import PropertyShape from '@/components/Templates/ShaclFlow/Node/PropertyShape';
import TargetClass from '@/components/Templates/ShaclFlow/Node/TargetClass';
import { Template } from '@/services/backend/types';

type NodeProps = {
    data: Template;
};

const Node: FC<NodeProps> = ({ data }) => {
    return (
        <div className="bg-background border-2 border-secondary rounded-md shadow">
            <NodeHeader label={data.label} id={data.id} />
            <div className="flex flex-col">
                <TargetClass data={data.target_class} nodeId={data.id} />
                {data.properties.map((ps) => (
                    <PropertyShape key={ps.id} data={ps} nodeId={data.id} />
                ))}
            </div>
            <NodeFooter isClosed={data.is_closed} targetClass={data.target_class} />
        </div>
    );
};

export default Node;
