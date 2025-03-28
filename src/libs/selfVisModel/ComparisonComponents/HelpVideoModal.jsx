import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

function HelpVideoModal(props) {
    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Comparison visualization instruction video</ModalHeader>
            <ModalBody>
                <div className="ratio ratio-16x9">
                    <iframe
                        title="Video explaining how to make a comparison visualization"
                        scrolling="no"
                        frameBorder="0"
                        src="//av.tib.eu/player/52057"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </ModalBody>
        </Modal>
    );
}

HelpVideoModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default HelpVideoModal;
