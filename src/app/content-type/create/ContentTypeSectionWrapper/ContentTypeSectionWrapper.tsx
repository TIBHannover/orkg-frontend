import { ReactNode } from 'react';

import HelpfulResourcesBox from '@/app/content-type/create/ContentTypeSectionWrapper/HelpfulResourcesBox/HelpfulResourcesBox';

type ContentTypeSectionWrapperProps = {
    title: string;
    description: ReactNode;
    helpfulResourcesSubtitle: string;
    helpfulResourcesExamples: ReactNode;
    video?: ReactNode;
    children: ReactNode;
    // Rendered below the two-column row, spanning the full container width
    // (e.g. the AI comparison creator, which needs more room than the form column).
    fullWidthContent?: ReactNode;
};

const ContentTypeSectionWrapper = ({
    title,
    description,
    helpfulResourcesSubtitle,
    helpfulResourcesExamples,
    video,
    children,
    fullWidthContent,
}: ContentTypeSectionWrapperProps) => (
    <>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 flex flex-col gap-4">
                <h1 className="text-2xl m-0">{title}</h1>
                <div className="m-0 leading-relaxed">{description}</div>
                <div className="mt-1">{children}</div>
            </div>
            <div className="md:w-1/3">
                <HelpfulResourcesBox title="Helpful resources" subtitle={helpfulResourcesSubtitle} video={video}>
                    {helpfulResourcesExamples}
                </HelpfulResourcesBox>
            </div>
        </div>
        {fullWidthContent}
    </>
);

export default ContentTypeSectionWrapper;
