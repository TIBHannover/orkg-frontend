import { faPlayCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';

const Video = () => {
    return (
        <Modal>
            <Button
                variant="ghost"
                className="min-w-0 p-0 m-0 text-inherit underline text-[length:inherit] hover:bg-transparent hover:text-foreground data-[hovered]:bg-transparent active:bg-transparent data-[pressed]:bg-transparent"
            >
                <FontAwesomeIcon icon={faPlayCircle} /> Play video
            </Button>
            <Modal.Backdrop>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-4xl">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>ORKG introduction video</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="aspect-video">
                                <iframe
                                    className="h-full w-full"
                                    title="Explanation and introduction video of the ORKG"
                                    scrolling="no"
                                    frameBorder="0"
                                    src="//av.tib.eu/player/16120"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
};

export default Video;
