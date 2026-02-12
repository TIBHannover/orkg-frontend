import { Metadata } from 'next';

import Home from '@/app/pageClient';

export const metadata: Metadata = {
    title: 'Open Research Knowledge Graph',
    description:
        'The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are easier to find and compare.',
    openGraph: {
        title: 'Open Research Knowledge Graph',
        type: 'website',
        description:
            'The Open Research Knowledge Graph (ORKG) aims to describe research papers in a structured manner. With the ORKG, papers are easier to find and compare.',
    },
};

export default function Page() {
    return <Home />;
}
