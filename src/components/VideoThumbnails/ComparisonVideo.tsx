import comparisonsThumbnail from '@/assets/img/video_thumbnails/comparisons.png';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';

const ComparisonVideo = () => (
    <VideoExplainer
        previewStyle={{ width: 65, height: 35, background: `url(${comparisonsThumbnail.src})` }}
        video={
            <iframe
                className="w-full aspect-video"
                src="https://www.youtube-nocookie.com/embed/j4lVfO6GBZ8"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        }
    />
);

export default ComparisonVideo;
