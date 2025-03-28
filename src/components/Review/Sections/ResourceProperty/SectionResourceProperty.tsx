import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import useReview from '@/components/Review/hooks/useReview';
import ROUTES from '@/constants/routes';
import { getReviewPublishedContents, reviewUrl } from '@/services/backend/reviews';
import { ReviewSection } from '@/services/backend/types';

type SectionResourcePropertyProps = {
    section: ReviewSection;
};

const SectionResourceProperty: FC<SectionResourcePropertyProps> = ({ section }) => {
    const { review } = useReview();
    const id = section.type === 'resource' ? section.resource?.id : section.predicate?.id;

    const { data: publishedContents } = useSWR(
        id && review ? [{ reviewId: review.id, entityId: id }, reviewUrl, 'getReviewPublishedContents'] : null,
        ([params]) => getReviewPublishedContents(params),
    );

    if (!review || !id) {
        return null;
    }

    if (!review.published) {
        return <DataBrowser id={id} showHeader={false} />;
    }

    return (
        <>
            <div className="mt-3 mb-2">
                <Link
                    href={
                        section.type === 'resource'
                            ? `${reverse(ROUTES.RESOURCE, {
                                  id: section.resource?.id,
                              })}?noRedirect`
                            : reverse(ROUTES.PREDICATE, {
                                  id: section.predicate?.id,
                              })
                    }
                    target="_blank"
                >
                    {section.type === 'resource' ? section.resource?.label : section.predicate?.label}
                </Link>
            </div>
            {publishedContents?.statements && (
                <DataBrowser
                    isEditMode={false}
                    id={id}
                    statementsSnapshot={publishedContents.statements}
                    propertiesAsLinks
                    valuesAsLinks
                    showHeader={false}
                />
            )}
        </>
    );
};

export default SectionResourceProperty;
