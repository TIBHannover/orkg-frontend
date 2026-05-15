import { readFileSync } from 'fs';
import { Metadata } from 'next';
import path from 'path';

import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { parseMarkdown } from '@/lib/markdown';

export const metadata: Metadata = {
    title: 'Changelog - ORKG',
};

export default function ChangelogPage() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const changelogText = readFileSync(changelogPath, 'utf-8');
    const html = parseMarkdown(changelogText);

    return (
        <div>
            <TitleBar>Changelog</TitleBar>
            <Container>
                <div className="box rounded pt-4 pb-4 ps-5 pe-5">
                    <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: html }} />
                </div>
            </Container>
        </div>
    );
}
