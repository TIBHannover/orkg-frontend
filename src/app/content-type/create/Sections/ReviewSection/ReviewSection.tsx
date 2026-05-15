'use client';

import Link from 'next/link';

import ContentTypeSectionWrapper from '@/app/content-type/create/ContentTypeSectionWrapper/ContentTypeSectionWrapper';
import CreateForm from '@/app/content-type/create/Sections/ReviewSection/CreateForm/CreateForm';
import ReviewVideo from '@/components/VideoThumbnails/ReviewVideo';
import ROUTES from '@/constants/routes';

const ReviewSection = () => (
    <ContentTypeSectionWrapper
        title="Reviews"
        description={
            <>
                <p>
                    ORKG reviews are dynamic, community maintained scholarly articles and are especially suitable for survey papers. Before creating a
                    review, make sure you understand the following points:
                </p>

                <ul className="mt-4">
                    <li>
                        A review can be <strong>changed by anyone</strong> (indeed, just like Wikipedia)
                    </li>
                    <li>
                        To make sure you work is not removed permanently by someone else, <strong>publish the article regularly</strong>{' '}
                    </li>
                    <li>
                        Everything you write is <strong>immediately visible for everyone</strong>{' '}
                    </li>
                </ul>
            </>
        }
        helpfulResourcesSubtitle="Example reviews within the ORKG"
        helpfulResourcesExamples={
            <ul className="py-2 m-0">
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
        <CreateForm />
    </ContentTypeSectionWrapper>
);

export default ReviewSection;
