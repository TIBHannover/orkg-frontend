import reviewsThumbnail from '@/assets/img/video_thumbnails/reviews.png';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';

const ReviewVideo = () => (
    <VideoExplainer
        previewStyle={{ width: 65, height: 35, background: `url(${reviewsThumbnail.src})` }}
        video={
            <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/FIFQKx-0Bqg"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        }
    />
);

export default ReviewVideo;
