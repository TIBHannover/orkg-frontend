'use client';

import { reverse } from 'named-urls';
import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Button from '@/components/Ui/Button/Button';
import ComparisonVideo from '@/components/VideoThumbnails/ComparisonVideo';
import ROUTES from '@/constants/routes';

const ComparisonSection = () => (
    <ContentTypeSectionWrapper
        title="Comparisons"
        description={
            <>
                ORKG Comparisons provide condensed overviews of the state-of-the-art literature for a particular research question. Comparisons
                present their information in tabular form and can be extended via additional ORKG Visualizations.{' '}
                <Link href="https://orkg.org/about/15/Comparisons" target="_blank">
                    More about comparisons
                </Link>{' '}
                or{' '}
                <Link href="https://academy.orkg.org/orkg-academy/main/courses/comparison-course.html" target="_blank">
                    learn more in the academy
                </Link>
                .
            </>
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
        <RequireAuthentication component={Button} color="light" href={reverse(ROUTES.CREATE_COMPARISON)}>
            Add comparison
        </RequireAuthentication>
    </ContentTypeSectionWrapper>
);

export default ComparisonSection;
