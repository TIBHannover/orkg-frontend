import { cache } from 'react';

import { getHelpCategory } from '@/services/cms';
import { HelpCategory } from '@/services/cms/types';

export const loadHelpCategory = cache(async (id: string): Promise<HelpCategory | null> => {
    try {
        const response = await getHelpCategory(id);
        return response.data ?? null;
    } catch (e) {
        console.error(e);
        return null;
    }
});
