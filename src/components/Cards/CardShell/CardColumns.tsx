import { FC, ReactNode } from 'react';

import RelativeBreadcrumbs from '@/components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { Node } from '@/services/backend/types';

type CardColumnsProps = {
    /** Main column */
    children: ReactNode;
    /** Narrow leading gutter for curation flags or a selection checkbox */
    gutter?: ReactNode;
    /** Rendered as breadcrumbs: in the aside on md+, in a row under the main column on mobile */
    researchField?: Node;
    /** Contributor avatar at the bottom of the aside */
    createdBy?: string;
    /** Extra aside content (e.g. a thumbnail). Hidden below md, like the aside breadcrumbs */
    aside?: ReactNode;
};

/**
 * The two-column body shared by the content-type cards (paper, comparison, review, list,
 * visualization, template): a 9/12 main column with an optional curation gutter, and a 3/12
 * aside carrying the research-field breadcrumbs, an optional thumbnail and the contributor.
 * Below md the aside collapses under the main column and its imagery is hidden.
 * Composes inside {@link CardShell}, which owns the card chrome around it.
 */
const CardColumns: FC<CardColumnsProps> = ({ children, gutter, researchField, createdBy, aside }) => (
    <div className="flex w-full flex-wrap">
        <div className="flex w-full p-0 md:w-9/12 md:shrink-0 md:grow-0 md:basis-9/12 md:max-w-9/12">
            {gutter && <div className="flex w-[25px] shrink-0 flex-col gap-1 mt-1">{gutter}</div>}
            <div className="flex min-w-0 grow flex-col">
                {children}
                {researchField && (
                    <div className="mt-1 md:hidden">
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                )}
            </div>
        </div>
        <div className="flex w-full flex-col items-end p-0 md:w-3/12 md:shrink-0 md:grow-0 md:basis-3/12 md:max-w-3/12">
            <div className="mb-1 grow">
                {researchField && (
                    <div className="hidden items-end justify-end md:flex">
                        <RelativeBreadcrumbs researchField={researchField} />
                    </div>
                )}
                {aside && <div className="mt-1 hidden items-end justify-end md:flex">{aside}</div>}
            </div>
            {createdBy && <UserAvatar userId={createdBy} />}
        </div>
    </div>
);

export default CardColumns;
