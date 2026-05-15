import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { ConferenceSeries } from '@/services/backend/types';

type EventsCardProps = {
    conference: ConferenceSeries;
};

const EventsCard: FC<EventsCardProps> = ({ conference }) => (
    <li className="block w-full bg-surface px-6 py-4 text-foreground">
        <Link href={reverse(ROUTES.EVENT_SERIES, { id: conference.display_id })}>{conference.name ? conference.name : <em>No title</em>}</Link>
    </li>
);

export default EventsCard;
