'use client';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/SoftwareSection/CreateForm/CreateForm';

type SoftwareSectionProps = {
    classId: string;
};

const SoftwareSection = ({ classId }: SoftwareSectionProps) => {
    return (
        <ContentTypeSectionWrapper
            title="Software"
            description={
                <p>
                    ORKG Software provides structured metadata descriptions for software. This includes capturing version information, dependencies,
                    and technical specifications, enabling better reproducibility and citation practices.
                </p>
            }
            helpfulResourcesSubtitle="Example software within the ORKG"
            helpfulResourcesExamples={
                <ul className="tw:py-2 tw:m-0!">
                    <li className="tw:italic">Examples coming soon</li>
                </ul>
            }
        >
            <CreateForm classId={classId} />
        </ContentTypeSectionWrapper>
    );
};

export default SoftwareSection;
