'use client';

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { ReactNode } from 'react';

import CopyId from '@/components/CopyId/CopyId';

type SelectedEntityPanelProps = {
    /** e.g. "Resource", "Literal", "Property" */
    kind: string;
    id?: string;
    href?: string;
    linkLabel?: string;
    children: ReactNode;
};

/** The floating card describing the current graph selection, shared by the node and edge boxes. */
const SelectedEntityPanel = ({ kind, id, href, linkLabel, children }: SelectedEntityPanelProps) => (
    <div className="absolute end-3 top-3 z-10 flex w-[320px] max-w-[calc(100%-1.5rem)] flex-col gap-2 rounded-[var(--radius)] border border-border bg-surface p-3 shadow-overlay">
        <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
                <Chip size="sm">
                    <Chip.Label>{kind}</Chip.Label>
                </Chip>
                {href && (
                    <Tooltip delay={300}>
                        <Tooltip.Trigger>
                            <Link href={href} target="_blank" aria-label={linkLabel} className="p-1 text-muted hover:text-accent">
                                <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
                            </Link>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{linkLabel}</Tooltip.Content>
                    </Tooltip>
                )}
            </div>
            {id && <CopyId id={id} size="sm" />}
        </div>
        {children}
    </div>
);

export default SelectedEntityPanel;
