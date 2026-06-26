import { faPython } from '@fortawesome/free-brands-svg-icons';
import { faDatabase, faDownload, faServer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { Card } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { Metadata } from 'next';
import { env } from 'next-runtime-env';

import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';

export const metadata: Metadata = {
    title: 'Data access - ORKG',
    description: 'Access ORKG data via REST API, Python package, SPARQL endpoint, or RDF dump.',
};

type AccessLink = {
    label: string;
    href: string;
};

type AccessMethod = {
    title: string;
    icon: FontAwesomeIconProps['icon'];
    description: string;
    links: AccessLink[];
};

export default function DataAccessPage() {
    const publicUrl = env('NEXT_PUBLIC_URL') ?? '';

    const methods: AccessMethod[] = [
        {
            title: 'REST API',
            icon: faServer,
            description: 'Access the Open Research Knowledge Graph programmatically through our documented REST API.',
            links: [{ label: 'API Documentation', href: 'http://tibhannover.gitlab.io/orkg/orkg-backend/api-doc/' }],
        },
        {
            title: 'Python Package',
            icon: faPython,
            description: 'A Python package that wraps the ORKG API for convenient use from notebooks and scripts.',
            links: [{ label: 'View on PyPI', href: 'https://pypi.org/project/orkg/' }],
        },
        {
            title: 'SPARQL Endpoint',
            icon: faDatabase,
            description: 'Query the ORKG knowledge graph directly using SPARQL through a visual editor or the Virtuoso query editor.',
            links: [
                { label: 'Virtuoso Query Editor', href: `${publicUrl}/triplestore` },
                { label: 'Visual SPARQL Editor', href: `${publicUrl}/sparql` },
            ],
        },
        {
            title: 'RDF Dump',
            icon: faDownload,
            description: 'Download the complete ORKG knowledge graph as an RDF dump in N-Triples format.',
            links: [{ label: 'Download RDF dump', href: `${publicUrl}/files/rdf-dumps/rdf-export-orkg.nt` }],
        },
    ];

    return (
        <>
            <TitleBar>Data access</TitleBar>
            <Container>
                <p className="rounded bg-surface-tertiary p-4 mb-6">
                    The ORKG data is openly available through multiple channels. Choose the access method that best fits your workflow.
                </p>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {methods.map((method) => (
                        <Card key={method.title} className="h-full">
                            <Card.Header>
                                <div className="flex items-center gap-3">
                                    <span className="bg-primary/10 text-primary inline-flex size-10 items-center justify-center rounded-lg">
                                        <FontAwesomeIcon icon={method.icon} className="size-5" />
                                    </span>
                                    <Card.Title className="text-xl">{method.title}</Card.Title>
                                </div>
                                <Card.Description className="mt-2">{method.description}</Card.Description>
                            </Card.Header>
                            <Card.Footer className="mt-auto flex flex-wrap gap-2">
                                {method.links.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            </Container>
        </>
    );
}
