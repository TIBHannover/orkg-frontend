import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import AddPaperWizard from '@/assets/img/tools/add-paper-wizard.png';
import ContributionEditor from '@/assets/img/tools/contribution-editor.png';
import CsvImport from '@/assets/img/tools/csv-import.png';
import PdfSentenceAnnotation from '@/assets/img/tools/pdf-sentence-annotation.png';
import ROUTES from '@/constants/routes';

export const metadata: Metadata = {
    title: 'Tools - ORKG',
    description: 'Tools to help you add, annotate, and import research data into the Open Research Knowledge Graph.',
};

const tools = [
    {
        href: ROUTES.CREATE_PAPER,
        title: 'Add paper form',
        image: AddPaperWizard,
        imageWidth: '70%',
        alt: 'Add paper form preview',
        description: 'The form guides you through the process of generating structured data for your paper',
    },
    {
        href: ROUTES.GRID_EDITOR,
        title: 'Grid editor',
        image: ContributionEditor,
        imageWidth: '60%',
        alt: 'Grid editor preview',
        description: 'Create multiple contributions simultaneously and create a comparison from them',
    },
    {
        href: ROUTES.PDF_ANNOTATION,
        title: 'PDF annotator',
        image: PdfSentenceAnnotation,
        imageWidth: '50%',
        alt: 'PDF sentence annotator preview or table extractor',
        description: 'Upload your paper as PDF and annotate the most important sentences or extract survey tables from the PDF',
    },
    {
        href: ROUTES.CSV_IMPORT,
        title: 'CSV import',
        image: CsvImport,
        imageWidth: '60%',
        alt: 'CSV import preview',
        description: 'Import a CSV file containing a list of papers and import them in bulk to ORKG',
    },
];

export default function ToolsPage() {
    return (
        <div className="mx-auto mt-8 flex max-w-[1340px] flex-wrap justify-center gap-8 px-4 max-md:mt-0 max-md:flex-col max-md:items-center">
            {tools.map((tool) => (
                <Link
                    key={tool.href}
                    href={tool.href}
                    className="box block w-[calc(33%-2rem)] shrink-0 rounded-lg text-center text-inherit no-underline transition-opacity duration-500 hover:opacity-70 max-md:w-full"
                >
                    <h2 className="mx-0 my-4 text-[1.4rem]">{tool.title}</h2>
                    <div className="flex h-40 items-center justify-center border-y-2 border-[var(--border)]">
                        <Image src={tool.image} style={{ width: tool.imageWidth, height: 'auto' }} alt={tool.alt} />
                    </div>
                    <p className="my-2 px-2">{tool.description}</p>
                </Link>
            ))}
        </div>
    );
}
