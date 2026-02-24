import React from 'react';

import comparisonsThumbnail from '@/assets/img/video_thumbnails/comparisons.png';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';

const ComparisonInfoText = () => {
    return (
        <div className="d-flex">
            <VideoExplainer
                previewStyle={{ width: 65, height: 35, background: `url(${comparisonsThumbnail.src})` }}
                video={
                    <iframe
                        width="560"
                        height="315"
                        src="https://www.youtube.com/embed/j4lVfO6GBZ8"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                }
            />
            <span>
                ORKG comparisons provide condensed overviews of the state-of-the-art for a particular research question.{' '}
                <a href="https://orkg.org/about/15/Comparisons" rel="noreferrer" target="_blank">
                    Visit the help center
                </a>{' '}
                or{' '}
                <a href="https://academy.orkg.org/orkg-academy/main/courses/comparison-course.html" rel="noreferrer" target="_blank">
                    learn more in the academy
                </a>
                .
            </span>
        </div>
    );
};

export default ComparisonInfoText;
