import Link from 'next/link';
import { ComponentProps, FC } from 'react';

import { isModifiedClickEvent } from '@/utilsTyped';

type HistoryLinkProps = Omit<ComponentProps<typeof Link>, 'prefetch' | 'rel' | 'onClick'> & {
    /**
     * Whether href is a `?history=` URL. That space is unbounded (graph paths
     * may be cyclic) and every URL in it serves the page it sits on, so it gets
     * rel="nofollow" to keep crawlers out; entity-page hrefs are real links and
     * stay followable.
     */
    isHistoryHref: boolean;
    /**
     * Replaces browser navigation on plain left-click (shallow pushState — no
     * Next.js router navigation, no RSC refetch). Modified clicks (middle,
     * ctrl/cmd/shift, right) fall through to the href, which makes new-tab and
     * copy-link work. Omit to render a plain link.
     */
    onNavigate?: () => void;
};

/**
 * The data-browser navigation anchor: a real link for everything the browser
 * does with links, intercepted only on plain left-click. Never prefetched —
 * `?history=` hrefs are unique per link (comparison tables render hundreds)
 * and their RSC payloads would never be consumed.
 */
const HistoryLink: FC<HistoryLinkProps> = ({ isHistoryHref, onNavigate, ...props }) => (
    <Link
        prefetch={false}
        rel={isHistoryHref ? 'nofollow' : undefined}
        onClick={(event) => {
            if (!onNavigate || isModifiedClickEvent(event)) return;
            event.preventDefault();
            onNavigate();
        }}
        {...props}
    />
);

export default HistoryLink;
