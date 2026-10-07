import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Internal lookup tool: it embeds a DataBrowser whose ?history= param spans an unbounded URL
// space, and none of it should ever be indexed. The page is a client component and cannot export
// metadata, so this pass-through layout carries the robots directive.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

const CsvImportLookupLayout = ({ children }: { children: ReactNode }) => children;

export default CsvImportLookupLayout;
