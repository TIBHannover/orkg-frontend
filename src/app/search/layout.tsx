import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Internal search results span an unbounded ?q= URL space and should never be indexed,
// but crawlers may still follow links to the actual content pages. The page is a client
// component and cannot export metadata, so this pass-through layout carries the directive.
export const metadata: Metadata = {
    robots: { index: false, follow: true },
};

const SearchLayout = ({ children }: { children: ReactNode }) => children;

export default SearchLayout;
