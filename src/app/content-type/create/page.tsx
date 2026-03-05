import { faBars, faChartLine, faComments, faFile, faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';
import { Metadata } from 'next';
import Link from 'next/link';
import { createLoader, parseAsString, SearchParams } from 'nuqs/server';
import pluralize from 'pluralize';

import ComparisonSection from '@/app/content-type/create/sections/ComparisonSection';
import DatasetSection from '@/app/content-type/create/sections/DatasetSection';
import ListSection from '@/app/content-type/create/sections/ListSection';
import PaperSection from '@/app/content-type/create/sections/PaperSection';
import ReviewSection from '@/app/content-type/create/sections/ReviewSection';
import SoftwareSection from '@/app/content-type/create/sections/SoftwareSection';
import VisualizationSection from '@/app/content-type/create/sections/VisualizationSection';
import { additionalContentTypes } from '@/components/ContentType/types';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
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
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                {SUPPORTED_CONTENT_TYPES.map((type) => (
                    <Link
                        key={type.id}
                        href={`?type=${type.id}`}
                        className={`btn ${
                            type.id === selectedClassId ? 'btn-primary' : 'btn-link text-decoration-none text-dark'
                        } px-2 me-1 tw:min-w-30 tw:text-center`}
                    >
                        <div style={{ fontSize: 30 }}>
                            <FontAwesomeIcon icon={type.icon} className={type.id !== selectedClassId ? 'text-secondary' : ''} />
                        </div>
                        {upperFirst(pluralize(type?.label || '', 0, false))}
                    </Link>
                ))}

                <hr />
                {selectedClassId === CLASSES.DATASET && <DatasetSection classId={selectedClassId} />}
                {selectedClassId === CLASSES.SOFTWARE && <SoftwareSection classId={selectedClassId} />}
                {selectedClassId === CLASSES.COMPARISON && <ComparisonSection />}
                {selectedClassId === CLASSES.VISUALIZATION && <VisualizationSection />}
                {selectedClassId === CLASSES.SMART_REVIEW && <ReviewSection />}
                {selectedClassId === CLASSES.LITERATURE_LIST && <ListSection />}
                {selectedClassId === CLASSES.PAPER && <PaperSection />}
            </Container>
        </>
    );
};

export default ContentTypeNew;
