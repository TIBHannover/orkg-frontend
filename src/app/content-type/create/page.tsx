import { faBars, faChartLine, faComments, faFile, faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, cn, Separator } from '@heroui/react';
import { upperFirst } from 'lodash';
import { Metadata } from 'next';
import Link from 'next/link';
import { createLoader, parseAsString, SearchParams } from 'nuqs/server';
import pluralize from 'pluralize';

import ComparisonSection from '@/app/content-type/create/Sections/ComparisonSection/ComparisonSection';
import DatasetSection from '@/app/content-type/create/Sections/DatasetSection/DatasetSection';
import ListSection from '@/app/content-type/create/Sections/ListSection/ListSection';
import PaperSection from '@/app/content-type/create/Sections/PaperSection/PaperSection';
import ReviewSection from '@/app/content-type/create/Sections/ReviewSection/ReviewSection';
import SoftwareSection from '@/app/content-type/create/Sections/SoftwareSection/SoftwareSection';
import VisualizationSection from '@/app/content-type/create/Sections/VisualizationSection/VisualizationSection';
import { additionalContentTypes } from '@/components/ContentType/types';
import TitleBar from '@/components/TitleBar/TitleBar';
import { CLASSES } from '@/constants/graphSettings';

export const metadata: Metadata = {
    title: 'Add to ORKG - ORKG',
};

const loadSearchParams = createLoader({
    type: parseAsString.withDefault(CLASSES.COMPARISON),
});

const SUPPORTED_CONTENT_TYPES = [
    {
        id: CLASSES.COMPARISON,
        label: 'Comparison',
        icon: faTable,
    },
    {
        id: CLASSES.VISUALIZATION,
        label: 'Visualization',
        icon: faChartLine,
    },
    {
        id: CLASSES.SMART_REVIEW,
        label: 'Review',
        icon: faComments,
    },
    {
        id: CLASSES.LITERATURE_LIST,
        label: 'List',
        icon: faBars,
    },
    {
        id: CLASSES.PAPER,
        label: 'Paper',
        icon: faFile,
    },
    ...additionalContentTypes,
];

type ContentTypeNewProps = {
    searchParams: Promise<SearchParams>;
};

const ContentTypeNew = async ({ searchParams }: ContentTypeNewProps) => {
    const { type: selectedClassId } = await loadSearchParams(searchParams);
    return (
        <>
            <TitleBar>Add to ORKG</TitleBar>
            <div className="mx-auto px-8 max-w-container box rounded py-6">
                <div className="flex flex-wrap gap-1">
                    {SUPPORTED_CONTENT_TYPES.map((type) => (
                        <Link
                            key={type.id}
                            href={`?type=${type.id}`}
                            className={cn(
                                'inline-flex flex-col items-center min-w-30 px-2 py-2 text-sm font-medium rounded-md text-center transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                                type.id === selectedClassId
                                    ? 'bg-accent text-white focus:ring-accent'
                                    : 'bg-transparent text-dark hover:underline focus:ring-0',
                            )}
                        >
                            <div className="text-[30px]">
                                <FontAwesomeIcon icon={type.icon} className={type.id !== selectedClassId ? 'text-secondary' : ''} />
                            </div>
                            {upperFirst(pluralize(type?.label || '', 0, false))}
                        </Link>
                    ))}
                </div>

                <Separator className="my-4" />

                {selectedClassId === CLASSES.DATASET && <DatasetSection classId={selectedClassId} />}
                {selectedClassId === CLASSES.SOFTWARE && <SoftwareSection classId={selectedClassId} />}
                {selectedClassId === CLASSES.COMPARISON && <ComparisonSection />}
                {selectedClassId === CLASSES.VISUALIZATION && <VisualizationSection />}
                {selectedClassId === CLASSES.SMART_REVIEW && <ReviewSection />}
                {selectedClassId === CLASSES.LITERATURE_LIST && <ListSection />}
                {selectedClassId === CLASSES.PAPER && <PaperSection />}
            </div>
        </>
    );
};

export default ContentTypeNew;
