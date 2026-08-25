import { cn } from '@heroui/react';
import { FC, ReactNode } from 'react';

import CardActionsMenu, { CardAction } from '@/components/Cards/CardShell/CardActionsMenu';

type CardShellProps = {
    /** The card body. Each child is a row in the body column, separated by the shell's own rhythm */
    children: ReactNode;
    /** Provenance row, rendered as the last row of the body column — typically a `CompactItemMetadata` */
    footer?: ReactNode;
    /** Right-hand column, e.g. action buttons. Kept out of the body column so wrapping content never runs under it */
    actions?: ReactNode;
    /** Entries of the card's overflow ("kebab") menu, rendered after `actions`. The standard slot for row actions like delete */
    menuActions?: CardAction[];
    /** Render a plain block instead of a list item, for the rare card shown outside a `ListGroup` */
    asListItem?: boolean;
    className?: string;
};

/**
 * The chrome every card and list row shares: padding rhythm, body/actions columns. No hover
 * feedback on purpose: the card itself is not interactive, only the content within is.
 *
 * It deliberately owns no content decisions — the body is a slot, so a title-and-metadata card
 * (`EntityCard`), a sentence (`SingleStatement`) or a content type's own two-column layout (`PaperCard`)
 * composes it rather than extending it. Row separation is *not* drawn here: a `ListGroup` parent already
 * divides its children, and a second border would double it.
 */
const CardShell: FC<CardShellProps> = ({ children, footer, actions, menuActions, asListItem = true, className }) => {
    const rootClassName = cn('flex items-start gap-2 px-6 py-4', className);
    const hasActions = actions || (menuActions && menuActions.length > 0);
    const content = (
        <>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                {children}
                {footer}
            </div>
            {hasActions && (
                <div className="flex shrink-0 items-center gap-1 self-stretch">
                    {actions}
                    {menuActions && <CardActionsMenu actions={menuActions} />}
                </div>
            )}
        </>
    );

    return asListItem ? (
        <li className={rootClassName} style={{ overflowWrap: 'anywhere' }}>
            {content}
        </li>
    ) : (
        <div className={rootClassName} style={{ overflowWrap: 'anywhere' }}>
            {content}
        </div>
    );
};

export default CardShell;
