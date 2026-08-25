import Link from 'next/link';
import { FC } from 'react';

import CardShell from '@/components/Cards/CardShell/CardShell';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource } from '@/services/backend/types';

type DiagramCardProps = {
    diagram: Resource;
};

const DiagramCard: FC<DiagramCardProps> = ({ diagram }) => (
    <CardShell>
        <div>
            <Link href={reverse(ROUTES.DIAGRAM, { id: diagram.id })}>{diagram.label ? diagram.label : <em>No title</em>}</Link>
            <br />
            <small>{diagram.id}</small>
        </div>
    </CardShell>
);

export default DiagramCard;
