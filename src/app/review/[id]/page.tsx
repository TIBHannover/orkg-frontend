'use client';

import NotFound from 'app/not-found';
import LoadingArticle from 'components/ArticleBuilder/LoadingArticle';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import EditReview from 'components/Review/EditReview/EditReview';
import TitleBar from 'components/Review/TitleBar/TitleBar';
import ViewReview from 'components/Review/ViewReview/ViewReview';
import ReviewContextProvider from 'components/Review/context/ReviewContext';
import useReview from 'components/Review/hooks/useReview';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { LICENSE_URL } from 'constants/misc';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    // ensure printing only prints the contents and no other elements
    @media print {
        nav,
        footer,
        .woot--bubble-holder,
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

    const version = review?.versions.published.find((_version) => _version.id === review?.id);
    const publicationDate = version ? moment(version.created_at).format('DD MMMM YYYY') : null;

    useEffect(() => {
        let title = 'Review - ORKG';
        if (review?.title) {
            title = `${review.title} - Review - ORKG`;
        }
        document.title = title;
    }, [review]);

    if (isLoading) {
        return <LoadingArticle />;
    }

    if (error) {
        return <NotFound />;
    }

    const ldJson = {
        mainEntity: {
            headline: `${review?.title ?? ''} - Review - ORKG`,
            description: version?.changelog,
            author: review?.authors.map((author) => ({
                name: author?.name,
                ...(author.identifiers.orcid?.[0] ? { url: `http://orcid.org/${author.identifiers.orcid?.[0]}` } : {}),
                '@type': 'Person',
            })),
            datePublished: publicationDate,
            about: review?.research_fields?.[0]?.label,
            license: LICENSE_URL,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    if (!review) {
        return null;
    }

    return (
        <div>
            {review.research_fields?.[0] && <Breadcrumbs researchFieldId={review.research_fields?.[0]?.id} />}
            <GlobalStyle />
            <Helmet>
                <title>{`${review.title ?? ''} - Review - ORKG`}</title>
                <meta property="og:title" content={`${review.title ?? ''} - Review - ORKG`} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={version?.changelog} />
                <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
            </Helmet>

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
