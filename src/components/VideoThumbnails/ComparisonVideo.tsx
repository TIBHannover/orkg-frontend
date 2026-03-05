import comparisonsThumbnail from '@/assets/img/video_thumbnails/comparisons.png';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';

const ComparisonVideo = () => (
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
);

export default ComparisonVideo;
