'use client';

import { useState } from 'react';

import NotFound from '@/app/not-found';
import LoadingArticle from '@/components/ArticleBuilder/LoadingArticle';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import ReviewContextProvider from '@/components/Review/context/ReviewContext';
import EditReview from '@/components/Review/EditReview/EditReview';
import useReview from '@/components/Review/hooks/useReview';
import TitleBar from '@/components/Review/TitleBar/TitleBar';
import ViewReview from '@/components/Review/ViewReview/ViewReview';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

const Review = () => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);

    const { review, isLoading, error } = useReview();
    const { isEditMode } = useIsEditMode();

    if (isLoading) {
        return <LoadingArticle />;
    }

    if (error) {
        return <NotFound />;
    }

    if (!review) {
        return null;
    }

    return (
        <div>
            {review.research_fields?.[0] && <Breadcrumbs researchFieldId={review.research_fields?.[0]?.id} />}

            <TitleBar isOpenHistoryModal={isOpenHistoryModal} setIsOpenHistoryModal={setIsOpenHistoryModal} />

            <ReviewContextProvider>
                {!isLoading && isEditMode && <EditReview />}
                {!isLoading && !isEditMode && <ViewReview setIsOpenHistoryModal={setIsOpenHistoryModal} />}
                {isLoading && <LoadingArticle />}
            </ReviewContextProvider>
        </div>
    );
};

export default Review;
