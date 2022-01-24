import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';

function HelpVideoModal(props) {
    return (
        <Modal size="lg" unmountOnClose={false} isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Comparison visualization instruction video</ModalHeader>
            <ModalBody>
                <div className="embed-responsive embed-responsive-16by9">
                    <iframe
                        title="Video explaining how to make a comparison visualization"
                        scrolling="no"
                        frameBorder="0"
                        src="//av.tib.eu/player/52057"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen={true}
                        className="embed-responsive-item"
                    />
                </div>
            </ModalBody>
        </Modal>
    );
}

HelpVideoModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default HelpVideoModal;
