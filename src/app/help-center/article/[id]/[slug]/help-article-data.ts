import { cache } from 'react';

import { getHelpArticle } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';

export const loadHelpArticle = cache(async (id: string): Promise<HelpArticle | null> => {
    try {
        const _page = await getHelpArticle(id);
        const raw = _page.data;
        const data: HelpArticle = Array.isArray(raw) ? raw[0] : raw;
        return data ?? null;
    } catch (e) {
        console.error(e);
        return null;
    }
});
