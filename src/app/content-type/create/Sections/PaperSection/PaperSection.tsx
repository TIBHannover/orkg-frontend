'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/PaperSection/CreateForm/CreateForm';
import ROUTES from '@/constants/routes';

const PaperSection = () => (
    <ContentTypeSectionWrapper
        title="Papers"
        description={
            <p>
                ORKG Papers are structured representations of scholarly knowledge that facilitate reuse. They generally serve as a supplement to
                existing publications.{' '}
                <Link href="https://orkg.org/about/20/Papers" target="_blank">
                    More about papers
                </Link>{' '}
                or{' '}
                <Link href="https://academy.orkg.org/courses/paper-course.html" target="_blank">
                    learn more in the academy
                </Link>
                .
            </p>
        }
        helpfulResourcesSubtitle="Example papers within the ORKG"
        helpfulResourcesExamples={
            <ul className="tw:py-2 tw:!m-0">
                <li>
                    <Link href="https://orkg.org/papers/R8186" target="_blank">
                        Open Research Knowledge Graph: Next Generation Infrastructure for Semantic Scholarly Knowledge
                    </Link>
                </li>
                <li>
                    <Link href={`${ROUTES.PAPERS}?visibility=FEATURED`} target="_blank">
                        More featured papers
                    </Link>
                </li>
            </ul>
        }
    >
        <CreateForm />
    </ContentTypeSectionWrapper>
);

export default PaperSection;
