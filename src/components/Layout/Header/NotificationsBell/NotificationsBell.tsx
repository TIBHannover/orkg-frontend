'use client';

import { faBell, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button, cn, Popover } from '@heroui/react';
import Link from 'next/link';
import { useState } from 'react';

import useAiJobs from '@/components/AiJobs/hooks/useAiJobs';
import useAiJobsUnseen from '@/components/AiJobs/hooks/useAiJobsUnseen';
import useAuthentication from '@/components/hooks/useAuthentication';
import NotificationsBellItem from '@/components/Layout/Header/NotificationsBell/NotificationsBellItem';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const MAX_VISIBLE_JOBS = 5;

type NotificationsBellProps = {
    isTransparentNavbar: boolean;
};

const NotificationsBell = ({ isTransparentNavbar }: NotificationsBellProps) => {
    const { user, status } = useAuthentication();
    const { jobs } = useAiJobs();
    const { unseenCount, isUnseen, markAllSeen } = useAiJobsUnseen();
    const [isOpen, setIsOpen] = useState(false);
    // Snapshot of the unseen jobs taken when the popover opens: opening clears
    // the badge (markAllSeen), but the rows should stay highlighted while the
    // user is looking at them.
    const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

    if (status !== 'authenticated' || !user) {
        return null;
    }

    // Cancelled jobs are noise in a notification list — the drafts tab keeps
    // the full history (there is no delete endpoint, so they never disappear).
    const visibleJobs = jobs.filter((job) => job.status !== 'cancelled').slice(0, MAX_VISIBLE_JOBS);

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            setHighlightedIds(new Set(jobs.filter(isUnseen).map((job) => job.id)));
            markAllSeen();
        }
    };

    const closePopover = () => setIsOpen(false);

    return (
        <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Button
                variant="secondary"
                isIconOnly
                aria-label={unseenCount > 0 ? `Notifications (${unseenCount} unread)` : 'Notifications'}
                className={cn(
                    'shrink-0 overflow-visible',
                    isTransparentNavbar && 'border-[#32303b] bg-[#32303b] text-white hover:border-[#100f13] hover:bg-[#100f13] hover:text-white',
                )}
            >
                <Badge.Anchor>
                    <FontAwesomeIcon className="size-4" icon={faBell} />
                    {unseenCount > 0 && (
                        <Badge color="danger" size="sm" className="-right-1 -top-1">
                            {unseenCount > 9 ? '9+' : unseenCount}
                        </Badge>
                    )}
                </Badge.Anchor>
            </Button>
            <Popover.Content placement="bottom end" className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden p-0">
                <Popover.Dialog className="p-0">
                    <div className="border-b border-default px-3 py-2">
                        <span className="text-sm font-semibold">AI comparison jobs</span>
                    </div>

                    {visibleJobs.length === 0 && (
                        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                            <FontAwesomeIcon icon={faWandMagicSparkles} className="text-smart text-2xl" />
                            <span className="text-sm text-muted">No AI comparison jobs yet</span>
                            <Link href={reverse(ROUTES.CONTENT_TYPE_NEW)} onClick={closePopover} className="text-sm">
                                Create a comparison with AI
                            </Link>
                        </div>
                    )}

                    {visibleJobs.map((job) => (
                        <NotificationsBellItem key={job.id} job={job} isHighlighted={highlightedIds.has(job.id)} onNavigate={closePopover} />
                    ))}

                    {visibleJobs.length > 0 && (
                        <div className="border-t border-default px-3 py-2 text-center">
                            <Link href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-ai-comparisons' })} onClick={closePopover} className="text-sm">
                                View all
                            </Link>
                        </div>
                    )}
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
};

export default NotificationsBell;
