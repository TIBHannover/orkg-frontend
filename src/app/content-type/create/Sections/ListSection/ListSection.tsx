'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/ListSection/CreateForm/CreateForm';
import ROUTES from '@/constants/routes';

const ListSection = () => (
    <ContentTypeSectionWrapper
        title="Lists"
        description={
            <p>
                ORKG lists provide a way to organize and describe state-of-the-art literature for a specific research domain. From lists, it is
                possible to create ORKG comparisons.
                <em>
                    Please note: a list can be <strong>changed by anyone</strong> (just like Wikipedia)
                </em>
            </p>
        }
        helpfulResourcesSubtitle="Example lists within the ORKG"
        helpfulResourcesExamples={
            <ul className="py-2 m-0">
                <li>
                    <Link href="https://orkg.org/lists/R1385252" target="_blank">
                        Semantic table interpretation
                    </Link>
                </li>
                <li>
                    <Link href="https://orkg.org/lists/R182413" target="_blank">
                        Production and Use of Videos in Requirements Engineering
                    </Link>
                </li>
                <li>
                    <Link href={`${ROUTES.LISTS}?visibility=FEATURED`} target="_blank">
                        More featured lists
                    </Link>
                </li>
            </ul>
        }
    >
        <CreateForm />
    </ContentTypeSectionWrapper>
);

export default ListSection;
