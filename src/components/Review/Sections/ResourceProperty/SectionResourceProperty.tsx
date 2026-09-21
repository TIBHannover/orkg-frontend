import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import useReview from '@/components/Review/hooks/useReview';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getReviewPublishedContents, reviewUrl } from '@/services/backend/reviews';
import { ReviewSection, Statement } from '@/services/backend/types';

type SectionResourcePropertyProps = {
    section: Extract<ReviewSection, { type: 'resource' | 'property' }>;
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

    // the published-contents endpoint delivers comparisons, visualizations or statement lists;
    // resource/property sections read the statement list. Snapshot consumers only read
    // id/subject/predicate/object/label/classes, which are identical in both shapes
    const statements = publishedContents?._class === 'statement_list' ? (publishedContents.statements as unknown as Statement[]) : undefined;

    return (
        <>
            <div className="mt-4 mb-2">
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
            {statements && (
                <DataBrowser
                    isEditMode={false}
                    id={id}
                    statementsSnapshot={statements}
                    snapshotCreatedAt={review.createdAt}
                    propertiesAsLinks
                    valuesAsLinks
                    showHeader={false}
                />
            )}
        </>
    );
};

export default SectionResourceProperty;
