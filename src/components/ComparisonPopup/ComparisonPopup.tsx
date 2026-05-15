'use client';

import { faCheck, faChevronUp, faCircleXmark, faTimes, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, cn, Drawer, ScrollShadow } from '@heroui/react';
import Link from 'next/link';
import { useCookies } from 'next-client-cookies';
import { FC, useCallback, useState } from 'react';

import useComparisonPopup from '@/components/ComparisonPopup/useComparisonPopup';
import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import ROUTES from '@/constants/routes';
import { isCookieInfoDismissed } from '@/lib/cookieHelpers';
import { reverse } from '@/lib/namedRoute';

const ComparisonPopup: FC = () => {
    const { comparison, updateComparison } = useComparisonPopup();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const cookies = useCookies();
    const COOKIE_NAME = 'cookieInfoDismissed';

    const removeFromComparison = useCallback(
        (id: string) => {
            updateComparison((prev) => {
                const { [id]: _, ...remainingById } = prev.byId;
                return {
                    byId: remainingById,
                    allIds: prev.allIds.filter((contributionId) => contributionId !== id),
                };
            });
        },
        [updateComparison],
    );

    const removeAllContributionsFromComparison = useCallback(() => {
        updateComparison(() => ({ byId: {}, allIds: [] }));
        setShowConfirmation(false);
    }, [updateComparison]);

    const handleOpenChange = useCallback((open: boolean) => {
        if (!open) setShowConfirmation(false);
        setIsDrawerOpen(open);
    }, []);

    const cookieInfoDismissed = isCookieInfoDismissed(cookies.get(COOKIE_NAME));
    const { allIds, byId } = comparison;

    if (allIds.length === 0) {
        return null;
    }

    const contributionAmount = allIds.length;
    const ids = allIds.join(',');
    const comparisonUrl = `${reverse(ROUTES.CREATE_COMPARISON)}?sourceIds=${ids}`;

    return (
        <>
            <Button
                variant="primary"
                className={cn(
                    'fixed right-8 z-[1000] rounded-b-none rounded-t-xl shadow-lg',
                    cookieInfoDismissed ? 'bottom-0' : 'bottom-[50px] max-[480px]:bottom-[120px] max-[1100px]:bottom-[70px]',
                )}
                onPress={() => setIsDrawerOpen(true)}
            >
                <Chip color="accent" variant="secondary" size="sm">
                    {contributionAmount}
                </Chip>
                Compare contributions
                <FontAwesomeIcon icon={faChevronUp} />
            </Button>

            <Drawer.Backdrop className="z-[1055]" isOpen={isDrawerOpen} onOpenChange={handleOpenChange} isDismissable>
                <Drawer.Content placement="right">
                    <Drawer.Dialog>
                        <Drawer.Header className="flex flex-row flex-nowrap items-center gap-3 border-b border-border bg-surface px-5 py-3">
                            <Chip color="accent" variant="secondary" size="sm">
                                {contributionAmount}
                            </Chip>
                            <span className="shrink-0 grow font-semibold text-foreground">Compare contributions</span>

                            <Tooltip content="Remove all contributions">
                                <Button
                                    isIconOnly
                                    variant="ghost"
                                    aria-label="Remove all contributions from comparison"
                                    onPress={() => setShowConfirmation(true)}
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faTrashCan} size="sm" className="text-danger" />
                                </Button>
                            </Tooltip>

                            <Drawer.CloseTrigger aria-label="Collapse comparison panel" />
                        </Drawer.Header>

                        {showConfirmation && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-danger/5 px-5 py-2.5">
                                <span className="text-sm font-medium text-danger">Remove all contributions?</span>
                                <div className="flex shrink-0 gap-2">
                                    <Button size="sm" variant="danger" onPress={removeAllContributionsFromComparison}>
                                        <FontAwesomeIcon icon={faCheck} />
                                        Remove
                                    </Button>
                                    <Button size="sm" variant="secondary" onPress={() => setShowConfirmation(false)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Drawer.Body className="bg-surface p-0">
                            <ScrollShadow className="h-full" orientation="vertical">
                                <ul className="divide-y divide-border p-0">
                                    {allIds.map((contributionId) => (
                                        <li key={contributionId} className="flex items-center gap-2 px-3 py-2.5 hover:bg-default/40">
                                            <div className="min-w-0 grow">
                                                <Link
                                                    href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                                        resourceId: byId[contributionId].paperId,
                                                        contributionId,
                                                    })}
                                                    className="line-clamp-2 text-sm font-medium text-foreground no-underline hover:text-accent"
                                                >
                                                    <PaperTitle title={byId[contributionId].paperTitle} />
                                                </Link>
                                                <p className="m-0 text-xs text-foreground/50">{byId[contributionId].contributionTitle}</p>
                                            </div>
                                            <div>
                                                <Tooltip content="Remove from comparison">
                                                    <Button
                                                        isIconOnly
                                                        variant="ghost"
                                                        size="sm"
                                                        onPress={() => removeFromComparison(contributionId)}
                                                        aria-label={`Remove ${byId[contributionId].paperTitle} from comparison`}
                                                    >
                                                        <FontAwesomeIcon icon={faCircleXmark} className="text-danger" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollShadow>
                        </Drawer.Body>

                        <Drawer.Footer className="justify-center border-t border-border bg-surface px-5 py-3">
                            {contributionAmount > 1 ? (
                                <Link href={comparisonUrl}>
                                    <Button variant="primary">Start comparison</Button>
                                </Link>
                            ) : (
                                <Tooltip content="Please select at least two contributions">
                                    <span>
                                        <Button variant="primary" isDisabled>
                                            Start comparison
                                        </Button>
                                    </span>
                                </Tooltip>
                            )}
                        </Drawer.Footer>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </>
    );
};

export default ComparisonPopup;
