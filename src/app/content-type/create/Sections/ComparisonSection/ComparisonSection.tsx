'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/ComparisonSection/CreateForm/CreateForm';
import ComparisonVideo from '@/components/VideoThumbnails/ComparisonVideo';
import ROUTES from '@/constants/routes';

const ComparisonSection = () => (
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
            <ul className="tw:py-2 tw:!m-0">
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
    >
        <CreateForm />
    </ContentTypeSectionWrapper>
);

export default ComparisonSection;
