'use client';

import { Card, cn } from '@heroui/react';
import Link from 'next/link';

import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import DraftAiComparisons from '@/components/UserSettings/DraftAiComparisons/DraftAiComparisons';
import DraftComparisons from '@/components/UserSettings/DraftComparisons/DraftComparisons';
import DraftLists from '@/components/UserSettings/DraftLists/DraftLists';
import DraftReviews from '@/components/UserSettings/DraftReviews/DraftReviews';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';

const TABS = {
    DRAFT_COMPARISONS: 'draft-comparisons',
    DRAFT_AI_COMPARISONS: 'draft-ai-comparisons',
    DRAFT_REVIEWS: 'draft-reviews',
    DRAFT_LISTS: 'draft-lists',
} as const;

const NAV_ITEMS = [
    { id: TABS.DRAFT_COMPARISONS, label: 'Draft comparisons' },
    { id: TABS.DRAFT_AI_COMPARISONS, label: 'Draft AI comparisons' },
    { id: TABS.DRAFT_REVIEWS, label: 'Draft reviews' },
    { id: TABS.DRAFT_LISTS, label: 'Draft lists' },
];

const TAB_KEYS = NAV_ITEMS.map((i) => i.id) as string[];

const UserSettings = () => {
    const { tab } = useParams();
    const activeTab = TAB_KEYS.includes(tab) ? tab : TABS.DRAFT_COMPARISONS;

    return (
        <>
            <TitleBar>My drafts</TitleBar>
            <Container>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                    <Card variant="default" className="md:w-3/12 md:shrink-0 md:sticky md:top-4">
                        <Card.Content className="p-2">
                            <nav aria-label="Draft sections" className="flex flex-col gap-1">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = activeTab === item.id;
                                    return (
                                        <Link
                                            key={item.id}
                                            href={reverse(ROUTES.USER_SETTINGS, { tab: item.id })}
                                            aria-current={isActive ? 'page' : undefined}
                                            className={cn(
                                                'block rounded-md px-3 py-2 text-sm font-medium no-underline hover:no-underline transition-colors',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                                                isActive ? 'bg-accent text-accent-foreground shadow-sm' : 'text-foreground hover:bg-default-100',
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </Card.Content>
                    </Card>
                    <div className="flex-1 min-w-0">
                        {activeTab === TABS.DRAFT_COMPARISONS && <DraftComparisons />}
                        {activeTab === TABS.DRAFT_AI_COMPARISONS && <DraftAiComparisons />}
                        {activeTab === TABS.DRAFT_REVIEWS && <DraftReviews />}
                        {activeTab === TABS.DRAFT_LISTS && <DraftLists />}
                    </div>
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(UserSettings);
