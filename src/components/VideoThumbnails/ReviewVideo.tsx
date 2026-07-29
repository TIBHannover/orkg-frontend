import reviewsThumbnail from '@/assets/img/video_thumbnails/reviews.png';
import VideoExplainer from '@/components/PaginatedContent/VideoExplainer';

const ReviewVideo = () => (
    <VideoExplainer
        previewStyle={{ width: 65, height: 35, background: `url(${reviewsThumbnail.src})` }}
        video={
            <iframe
                className="w-full aspect-video"
                src="https://www.youtube-nocookie.com/embed/FIFQKx-0Bqg"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
        }
    />
);

export default ReviewVideo;
