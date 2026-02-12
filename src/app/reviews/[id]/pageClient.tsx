'use client';

import { useState } from 'react';
import { createGlobalStyle } from 'styled-components';

import NotFound from '@/app/not-found';
import LoadingArticle from '@/components/ArticleBuilder/LoadingArticle';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import ReviewContextProvider from '@/components/Review/context/ReviewContext';
import EditReview from '@/components/Review/EditReview/EditReview';
import useReview from '@/components/Review/hooks/useReview';
import TitleBar from '@/components/Review/TitleBar/TitleBar';
import ViewReview from '@/components/Review/ViewReview/ViewReview';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

const GlobalStyle = createGlobalStyle`
    // ensure printing only prints the contents and no other elements
    @media print {
        nav,
        footer,
        .container:not(.print-only) {
            display: none !important;
        }
        .container.print-only {
            margin: 0;
            padding: 0;
            max-width: 100%;
            margin-top: -100px;

            .box {
                box-shadow: none;
            }
        }
        body {
            background-color: #fff !important;
        }
    }
`;

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
            <GlobalStyle />

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
