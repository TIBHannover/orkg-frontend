import { reverse } from 'named-urls';
import { notFound, redirect } from 'next/navigation';

import NotFound from '@/app/not-found';
import ROUTES from '@/constants/routes';
import { getAboutPages } from '@/services/cms';
import { CmsResponsePaginated, HelpArticle } from '@/services/cms/types';
import { slugify } from '@/utils';

const About = async () => {
    let pages: CmsResponsePaginated<HelpArticle> | void;
    try {
        pages = await getAboutPages();
    } catch (e) {
        console.error('Error getting about pages');
        return notFound();
    }
    const id = pages?.data?.[0]?.id;
    const title = pages?.data?.[0]?.attributes.title;

    if (!id) {
        return <NotFound />;
    }
    return redirect(reverse(ROUTES.ABOUT, { id, slug: slugify(title) }));
};

export default About;
