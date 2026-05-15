import { cache } from 'react';

import { getAboutPage } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';

export const loadAboutPage = cache(async (id: number): Promise<HelpArticle | null> => {
    try {
        const _page = await getAboutPage(id);
        const raw = _page.data;
        const data: HelpArticle = Array.isArray(raw) ? raw[0] : raw;
        return data ?? null;
    } catch (e) {
        console.error(e);
        return null;
    }
});
