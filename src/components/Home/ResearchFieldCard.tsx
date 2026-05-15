import { cn } from '@heroui/react';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import pluralize from 'pluralize';
import { FC } from 'react';
import useSWR from 'swr';

import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

type ResearchFieldCardProps = {
    field: Node;
};

const ResearchFieldCard: FC<ResearchFieldCardProps> = ({ field }) => {
    const { data: stats, isLoading } = useSWR([field.id, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all([
            getStatistics({ parameters: { research_field: params, include_subfields: 'true' }, group: 'content-types', name: 'paper-count' }),
            getStatistics({ parameters: { research_field: params, include_subfields: 'true' }, group: 'content-types', name: 'comparison-count' }),
        ]),
    );

    const [contentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });
    const paperCount = stats?.[0]?.value ?? 0;
    const comparisonCount = stats?.[1]?.value ?? 0;
    const isEmpty = paperCount === 0;

    const href = `${reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
        researchFieldId: field.id,
        slug: field.label,
    })}?contentType=${contentType}`;

    const cardClass = cn(
        'flex min-h-[85px] min-w-[140px] flex-[0_0_calc(20%-20px)] flex-col items-center justify-center',
        'rounded-xl bg-accent m-2.5 px-2 py-3 text-center no-underline',
        'transition-opacity duration-200 break-anywhere',
        'hover:opacity-80 active:relative active:top-1',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        'max-[400px]:flex-[0_0_80%]',
        isEmpty && 'pointer-events-none opacity-50',
    );

    return (
        <Link
            href={href}
            className={cardClass}
            aria-disabled={isEmpty || undefined}
            aria-label={`${field.label} — ${pluralize('paper', paperCount, true)}, ${pluralize('comparison', comparisonCount, true)}`}
            tabIndex={isEmpty ? -1 : undefined}
        >
            <span className="text-base font-medium text-accent-foreground">{field.label}</span>
            <span className="mt-1 text-xs text-accent-foreground/70">
                {!isLoading ? (
                    <>
                        {pluralize('paper', paperCount, true)} &middot; {pluralize('comparison', comparisonCount, true)}
                    </>
                ) : (
                    'Loading…'
                )}
            </span>
        </Link>
    );
};

export default ResearchFieldCard;
