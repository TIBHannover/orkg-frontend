import { cn } from '@heroui/react';
import { FC, Fragment, ReactNode } from 'react';

export type MetadataRowItem = {
    /** Also used as the React key */
    key: string;
    node: ReactNode;
};

type MetadataRowProps = {
    /** Rendered in order, separated by a stroke. Falsy entries are dropped; an empty row renders nothing */
    items: (MetadataRowItem | false | null | undefined)[];
    className?: string;
};

/**
 * The metadata row cards and list rows share: small text items divided by a stroke. Composes inside
 * {@link CardShell}; each item brings its own icon, title attribute and screen-reader label.
 */
const MetadataRow: FC<MetadataRowProps> = ({ items, className }) => {
    const visibleItems = items.filter((item): item is MetadataRowItem => Boolean(item));

    if (visibleItems.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', className)}>
            {visibleItems.map(({ key, node }, index) => (
                <Fragment key={key}>
                    {index > 0 && (
                        <span aria-hidden className="select-none text-border">
                            |
                        </span>
                    )}
                    {node}
                </Fragment>
            ))}
        </div>
    );
};

export default MetadataRow;
