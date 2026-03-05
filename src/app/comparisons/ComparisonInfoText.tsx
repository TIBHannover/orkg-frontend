import ComparisonVideo from '@/components/VideoThumbnails/ComparisonVideo';

const ComparisonInfoText = () => {
    return (
        <div className="d-flex">
            <ComparisonVideo />
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
