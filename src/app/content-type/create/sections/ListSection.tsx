'use client';

import { reverse } from 'named-urls';
import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';

const ListSection = () => (
    <ContentTypeSectionWrapper
        title="Lists"
        description={
            <>
                ORKG Lists enable researchers to create and share curated collections of related papers and resources, facilitating knowledge
                organization and discovery.{' '}
                <Link href="https://orkg.org/about/17/Lists" target="_blank">
                    More about lists
                </Link>
                .
            </>
        }
        helpfulResourcesSubtitle="Example lists within the ORKG"
        helpfulResourcesExamples={
            <ul className="tw:py-2 tw:!m-0">
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
        <RequireAuthentication component={Button} color="light" href={reverse(ROUTES.LIST_NEW)}>
            Add list
        </RequireAuthentication>
    </ContentTypeSectionWrapper>
);

export default ListSection;
