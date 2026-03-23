import { notFound, redirect } from 'next/navigation';

import { getThing } from '@/services/backend/things';
import { getResourceLink } from '@/utils';

const ThingPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    let thing;
    try {
        thing = await getThing(id);
    } catch (error) {
        return notFound();
    }
    return redirect(getResourceLink(thing._class, thing.id));
};

export default ThingPage;
