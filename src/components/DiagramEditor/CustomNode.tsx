import { Handle, Position } from '@xyflow/react';
import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { getPaper } from '@/services/backend/papers';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';
import { getResourceLink } from '@/utils';

type CustomNodeProps = {
    data: Resource;
};

const CustomNode: FC<CustomNodeProps> = ({ data }) => {
    const { data: paper } = useSWR(data.id ? [data.id, statementsUrl, 'getStatements'] : null, ([_params]) =>
        getStatements({
            objectId: _params,
            subjectClasses: [CLASSES.PAPER],
            predicateId: PREDICATES.HAS_CONTRIBUTION,
            returnContent: true,
            returnFormattedLabels: true,
        }).then((statements) => (statements[0]?.subject ? getPaper(statements[0]?.subject.id) : null)),
    );

    return (
        <>
            <Handle type="target" position={Position.Top} />
            {data.id !== data.label ? (
                <Link href={getResourceLink(data.classes?.[0], data.id)}>
                    {paper?.id ? `${paper.title} - ` : ''}
                    {data.label}
                </Link>
            ) : (
                data.label
            )}
            <Handle type="source" position={Position.Bottom} />
        </>
    );
};

export default CustomNode;
