'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/DatasetSection/CreateForm/CreateForm';

type DatasetSectionProps = {
    classId: string;
};

const DatasetSection = ({ classId }: DatasetSectionProps) => {
    return (
        <ContentTypeSectionWrapper
            title="Datasets"
            description={
                <p>
                    ORKG Datasets provide structured metadata descriptions for datasets. Datasets can be published with a DOI, which persists the
                    state of the dataset and makes them suitable for reuse in research. This structured approach ensures better discoverability and
                    citation tracking.
                </p>
            }
            helpfulResourcesSubtitle="Example datasets within the ORKG"
            helpfulResourcesExamples={
                <ul className="tw:py-2 tw:m-0!">
                    <li>
                        <Link href="https://orkg.org/content-type/Dataset/R75321" target="_blank">
                            SemEval-2021 Task 11
                        </Link>
                    </li>
                    <li>
                        <Link href="https://orkg.org/content-type/Dataset/R1568117" target="_blank">
                            SCITAB
                        </Link>
                    </li>
                </ul>
            }
        >
            <CreateForm classId={classId} />
        </ContentTypeSectionWrapper>
    );
};

export default DatasetSection;
