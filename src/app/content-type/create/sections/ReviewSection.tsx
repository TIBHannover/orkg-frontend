'use client';

import { reverse } from 'named-urls';
import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import Button from '@/components/Ui/Button/Button';
import ReviewVideo from '@/components/VideoThumbnails/ReviewVideo';
import ROUTES from '@/constants/routes';

const ReviewSection = () => (
    <ContentTypeSectionWrapper
        title="Reviews"
        description={
            <>
                ORKG Reviews enable dynamic literature reviews that can be updated as new research emerges, providing living documents of scholarly
                knowledge.{' '}
                <Link href="https://orkg.org/about/16/Reviews" target="_blank">
                    More about reviews
                </Link>
                .
            </>
        }
        helpfulResourcesSubtitle="Example reviews within the ORKG"
        helpfulResourcesExamples={
            <ul className="tw:py-2 tw:!m-0">
                <li>
                    <Link href="https://orkg.org/reviews/R135360" target="_blank">
                        Scholarly Knowledge Graphs
                    </Link>
                </li>
                <li>
                    <Link href="https://orkg.org/reviews/R606854" target="_blank">
                        Exploring Popular Knowledge Graph Tasks in Natural Language Processing
                    </Link>
                </li>
                <li>
                    <Link href={`${ROUTES.REVIEWS}?visibility=FEATURED`} target="_blank">
                        More featured reviews
                    </Link>
                </li>
            </ul>
        }
        video={<ReviewVideo />}
    >
        <RequireAuthentication component={Button} color="light" href={reverse(ROUTES.REVIEW_NEW)}>
            Add review
        </RequireAuthentication>
    </ContentTypeSectionWrapper>
);

export default ReviewSection;
