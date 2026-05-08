import 'server-only';

import { cache } from 'react';

import { getComparison, getComparisonContents } from '@/services/backend/comparisons';

export const loadComparison = cache((id: string) => getComparison(id));
export const loadComparisonContents = cache((id: string) => getComparisonContents(id));
