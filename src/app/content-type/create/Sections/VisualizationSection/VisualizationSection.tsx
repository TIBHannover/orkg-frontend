'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import Button from '@/components/Ui/Button/Button';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const VisualizationSection = () => (
    <ContentTypeSectionWrapper
        title="Visualizations"
        description={
            <p>
                ORKG Visualizations show comparison data in different formats and can only be added to comparisons. First, create a comparison
                Afterward, you can create a visualization. More about visualizations in the{' '}
                <Link href="https://academy.orkg.org/orkg-academy/main/tutorials/visualization-tutorial.html" target="_blank">
                    ORKG Academy
                </Link>
                .
            </p>
        }
        helpfulResourcesSubtitle="Example visualizations within the ORKG"
        helpfulResourcesExamples={
            <ul className="tw:py-2 tw:!m-0">
                <li>
                    <Link href="https://orkg.org/resources/R1586630/preview?noRedirect" target="_blank">
                        Visualization of Nutritional Composition of Condrès
                    </Link>
                </li>
                <li>
                    <Link href={ROUTES.VISUALIZATIONS} target="_blank">
                        More visualizations
                    </Link>
                </li>
            </ul>
        }
    >
        <Button color="light" tag={Link} href={`${ROUTES.CONTENT_TYPE_NEW}?type=${CLASSES.COMPARISON}`}>
            Add comparison
        </Button>
    </ContentTypeSectionWrapper>
);

export default VisualizationSection;
