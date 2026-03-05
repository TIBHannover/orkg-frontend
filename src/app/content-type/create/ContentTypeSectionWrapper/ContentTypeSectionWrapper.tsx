import { ReactNode } from 'react';

import HelpfulResourcesBox from '@/app/content-type/create/ContentTypeSectionWrapper/HelpfulResourcesBox/HelpfulResourcesBox';

type ContentTypeSectionWrapperProps = {
    title: string;
    description: ReactNode;
    helpfulResourcesSubtitle: string;
    helpfulResourcesExamples: ReactNode;
    video?: ReactNode;
    children: ReactNode;
};

const ContentTypeSectionWrapper = ({
    title,
    description,
    helpfulResourcesSubtitle,
    helpfulResourcesExamples,
    video,
    children,
}: ContentTypeSectionWrapperProps) => (
    <div className="tw:flex">
        <div className="tw:w-2/3 me-3">
            <h1 className="tw:!text-2xl">{title}</h1>
            <p>{description}</p>
            {children}
        </div>
        <div className="tw:w-1/3">
            <HelpfulResourcesBox title="Helpful resources" subtitle={helpfulResourcesSubtitle} video={video}>
                {helpfulResourcesExamples}
            </HelpfulResourcesBox>
        </div>
    </div>
);

export default ContentTypeSectionWrapper;
