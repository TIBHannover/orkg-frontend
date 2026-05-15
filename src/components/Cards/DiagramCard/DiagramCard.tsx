import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource } from '@/services/backend/types';

type DiagramCardProps = {
    diagram: Resource;
};

const DiagramCard: FC<DiagramCardProps> = ({ diagram }) => (
    <div className="list-group-item py-3 px-4">
        <Link href={reverse(ROUTES.DIAGRAM, { id: diagram.id })}>{diagram.label ? diagram.label : <em>No title</em>}</Link>
        <br />
        <small>{diagram.id}</small>
    </div>
);

export default DiagramCard;
