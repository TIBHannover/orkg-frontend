import { ComparisonPath } from '@/services/backend/types';

export type PathWithSettings = ComparisonPath & { isExpanded?: boolean; isSelected?: boolean; children: PathWithSettings[] };
