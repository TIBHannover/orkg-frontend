'use client';

import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import AiComparisonCreator from '@/app/content-type/create/Sections/ComparisonSection/AiComparisonCreator/AiComparisonCreator';
import CreateForm from '@/app/content-type/create/Sections/ComparisonSection/CreateForm/CreateForm';
import ComparisonVideo from '@/components/VideoThumbnails/ComparisonVideo';
import ROUTES from '@/constants/routes';

const ComparisonSection = () => {
    // The form is disabled while an AI job is shown, and the AI creator is
    // hidden when the form is pre-filled with sources from the URL.
    const [isAiCreatorLoading, setIsAiCreatorLoading] = useState(false);
    const [sourceIds] = useQueryState<string[]>('sourceIds', {
        defaultValue: [],
        parse: (value) => value.split(','),
    });

    return (
        <ContentTypeSectionWrapper
            title="Comparisons"
            description={
                <p>
                    ORKG Comparisons provide condensed overviews of the state-of-the-art literature for a particular research question. Comparisons
                    present their information in tabular form and can be extended via additional ORKG Visualizations.{' '}
                    <Link href="https://orkg.org/about/15/Comparisons" target="_blank">
                        More about comparisons
                    </Link>{' '}
                    or{' '}
                    <Link href="https://academy.orkg.org/courses/comparison-course.html" target="_blank">
                        learn more in the academy
                    </Link>
                    .
                </p>
            }
            helpfulResourcesSubtitle="Example comparisons within the ORKG"
            helpfulResourcesExamples={
                <ul className="py-2 m-0">
                    <li>
                        <Link href="https://orkg.org/comparisons/R642234" target="_blank">
                            Comparison of SemTab@ISWC 2019 systems for tabular data annotation
                        </Link>
                    </li>
                    <li>
                        <Link href="https://orkg.org/comparisons/R598411" target="_blank">
                            Hand gesture recognition methods
                        </Link>
                    </li>
                    <li>
                        <Link href="https://orkg.org/comparisons/R44930" target="_blank">
                            COVID-19 Reproductive Number Estimates
                        </Link>
                    </li>
                    <li>
                        <Link href={`${ROUTES.COMPARISONS}?visibility=FEATURED`} target="_blank">
                            More featured comparisons
                        </Link>
                    </li>
                </ul>
            }
            video={<ComparisonVideo />}
            fullWidthContent={(!sourceIds || sourceIds.length === 0) && <AiComparisonCreator onLoadingChange={setIsAiCreatorLoading} />}
        >
            <CreateForm isDisabled={isAiCreatorLoading} />
        </ContentTypeSectionWrapper>
    );
};

export default ComparisonSection;
