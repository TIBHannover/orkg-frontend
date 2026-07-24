import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import { ReactNode } from 'react';

import HistoryLink from '@/components/DataBrowser/components/HistoryLink/HistoryLink';
import useBreadcrumbs from '@/components/DataBrowser/hooks/useBreadcrumbs';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import { ENTITIES } from '@/constants/graphSettings';
import { getLinkByEntityType } from '@/utils';

// Collapsed pills expand on hover (max-width transition); the last pill is the
// current entity and stays expanded and accent-filled. Overlap (-ml) keeps the
// trail compact — min-w-0/overflow-hidden on the inner link clip to the pill.
const breadcrumbItemClasses =
    'flex text-nowrap overflow-hidden rounded-[5px] border border-accent bg-surface text-[87%] max-w-[55px] transition-[max-width] duration-500 ' +
    'hover:max-w-full not-last:hover:text-secondary-darker last:max-w-full last:bg-accent last:text-white not-first:-ml-[15px]';

const Breadcrumbs = () => {
    // Crumb targets are absolute paths already anchored at the dialog root, so
    // they use setHistory/getAbsoluteHistoryHref — never the relative
    // (expandPath-based) navigateToPath, which would mis-read a root target as
    // "relative to the current entity" on cyclic paths.
    const { history, rootPrefix, canNavigateAboveRoot, isLocalHistory, setHistory, getAbsoluteHistoryHref } = useHistory();

    const { historyEntities, isLoading } = useBreadcrumbs();

    // In local mode there is no URL that owns the state (href is null) — crumbs
    // fall back to the target entity's own page for middle-click/new-tab
    // (historyEntities is index-aligned with history; the crumb's entity is the
    // last element of its target path). Left-click navigates in-place either way.
    const hrefFor = (targetPath: string[]) => {
        const historyHref = getAbsoluteHistoryHref(targetPath);
        if (historyHref !== null) return historyHref;
        const target = historyEntities?.[targetPath.length - 1];
        return getLinkByEntityType(target?._class ?? ENTITIES.RESOURCE, targetPath[targetPath.length - 1]) || '#';
    };

    if (!history || history.length <= 1) {
        return <h3 className="grow mb-0 text-lg">Data browser</h3>;
    }

    if (isLoading) {
        return (
            <div className="grow">
                <Skeleton className="w-[100px] h-4 rounded" />
            </div>
        );
    }

    // Crumbs above the dialog's fixed root prefix hand the path off to the column
    // header's dialog (see computeUpdatedHistory); without such an owner they are
    // context labels. The current crumb is never a link.
    const isNavigable = (targetPath: string[]) =>
        (targetPath.length >= rootPrefix.length || canNavigateAboveRoot) && targetPath.length < history.length;

    // min-w-0 + overflow-hidden keep the link's hit area inside the clipped pill —
    // without them the anchor keeps its full text width and most of it sits
    // invisibly under the neighboring (overlapping) pills
    const crumb = (targetPath: string[], title: string | undefined, children: ReactNode) =>
        isNavigable(targetPath) ? (
            <HistoryLink
                href={hrefFor(targetPath)}
                isHistoryHref={!isLocalHistory}
                onNavigate={() => setHistory(targetPath)}
                className="flex w-full min-w-0 overflow-hidden px-4 py-1 text-inherit"
                title={title}
            >
                {children}
            </HistoryLink>
        ) : (
            <div className="flex w-full min-w-0 overflow-hidden px-4 py-1" title={title}>
                {children}
            </div>
        );

    const backPath = history.slice(0, history.length - 2);

    return (
        <div className="grow flex shrink-0 w-full md:shrink-0 md:grow-0 md:w-10/12 md:basis-10/12 md:max-w-10/12">
            {(history.length > rootPrefix.length || canNavigateAboveRoot) && (
                <HistoryLink
                    href={hrefFor(backPath)}
                    isHistoryHref={!isLocalHistory}
                    onNavigate={() => setHistory(backPath)}
                    title="Back"
                    aria-label="Back"
                    className="flex items-center px-2 mr-2 rounded-md border border-accent text-accent text-sm hover:bg-accent hover:text-white"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </HistoryLink>
            )}
            <ul className="list-unstyled p-0 flex w-3/4 m-0">
                <li className={breadcrumbItemClasses}>{crumb(history.slice(0, 1), historyEntities?.[0]?.label, historyEntities?.[0]?.label)}</li>
                {history
                    .slice(1)
                    .filter((_, index) => index % 2 === 0)
                    .map((_, index) => {
                        // history alternates entity/property, so the nth kept item sits at 1 + 2n.
                        // Looking the id up instead would collapse cyclic paths onto their first
                        // occurrence, rendering the same crumb twice.
                        const propertyIndex = 1 + index * 2;
                        const propertyLabel = historyEntities?.[propertyIndex]?.label;
                        const resourceLabel = historyEntities?.[propertyIndex + 1]?.label || 'No label';
                        return (
                            <li className={breadcrumbItemClasses} key={propertyIndex}>
                                {crumb(
                                    history.slice(0, propertyIndex + 2),
                                    `${propertyLabel ? `${propertyLabel} → ` : ''}${resourceLabel}`,
                                    propertyLabel ? (
                                        <>
                                            <i>{propertyLabel}</i> <FontAwesomeIcon icon={faArrowRight} /> {resourceLabel}
                                        </>
                                    ) : (
                                        resourceLabel
                                    ),
                                )}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
};

export default Breadcrumbs;
