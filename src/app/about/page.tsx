import { reverse } from 'named-urls';
import { redirect } from 'next/navigation';

import NotFound from '@/app/not-found';
import ROUTES from '@/constants/routes';
import { getAboutPages } from '@/services/cms';
import { slugify } from '@/utils';

const About = async () => {
    const pages = await getAboutPages();
    const id = pages?.data?.[0]?.id;
    const title = pages?.data?.[0]?.attributes.title;

    if (!id) {
        return <NotFound />;
    }
    return redirect(reverse(ROUTES.ABOUT, { id, slug: slugify(title) }));
};

export default About;
