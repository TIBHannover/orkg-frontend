import { cache } from 'react';

import { getPageByUrl } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';

export const loadCmsPageByUrl = cache(async (url: string): Promise<HelpArticle | null> => {
    try {
        const _page = await getPageByUrl(url);
        const raw = _page.data;
        const data: HelpArticle = Array.isArray(raw) ? raw[0] : raw;
        return data ?? null;
    } catch (e) {
        console.error(e);
        return null;
    }
});
