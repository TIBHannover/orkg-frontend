'use client';

import dayjs from 'dayjs';
import { reverse } from 'named-urls';

import DiffView from '@/components/DiffView/DiffView';
import useDiff from '@/components/DiffView/useDiff';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useReview from '@/components/Review/hooks/useReview';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { Review } from '@/services/backend/types';

const ReviewDiff = () => {
    const { reviewToPlainText } = useDiff();
    const { oldId, newId } = useParams<{ oldId: string; newId: string }>();
    const { review: oldReview } = useReview(oldId);
    const { review: newReview } = useReview(newId);

    const getTitleData = ({ versions, id }: Review) => {
        const version = versions.published.find((_version) => _version.id === id);
        if (!version) {
            return null;
        }

        const versionNumber = versions.published.length
            ? versions.published.length - versions.published.findIndex((_version) => _version.id === id)
            : null;
        const publicationDate = version ? dayjs(version.created_at).format('DD MMMM YYYY - H:m:s') : null;

        return {
            creator: version.created_by,
            route: reverse(ROUTES.REVIEW, { id: version.id }),
            headerText: version && (
                <Tooltip content={`Update message: ${version.changelog}`}>
                    <span>
                        Version {versionNumber} - {publicationDate}
                    </span>
                </Tooltip>
            ),
            buttonText: 'View article',
        };
    };

    const getData = async () => {
        if (!oldReview || !newReview || oldReview.versions.head?.id !== newReview.versions.head?.id) {
            throw new Error('Reviews not found');
        }
        return {
            oldText: reviewToPlainText(oldReview),
            newText: reviewToPlainText(newReview),
            oldTitleData: getTitleData(oldReview),
            newTitleData: getTitleData(newReview),
        };
    };

    return <DiffView diffRoute={ROUTES.REVIEW_DIFF} type="review" getData={getData} />;
};

export default ReviewDiff;
