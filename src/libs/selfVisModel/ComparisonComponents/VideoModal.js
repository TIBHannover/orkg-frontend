import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import PropTypes from 'prop-types';

function SVSVideoModal(props) {
    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Self Visualization Service Instruction Video</ModalHeader>
            <ModalBody>
                <div className="embed-responsive embed-responsive-16by9" style={{ height: props.height }}>
                    <iframe
                        title="How to make an ORKG comparison"
                        scrolling="no"
                        frameBorder="0"
                        src="//av.tib.eu/player/51996"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen={true}
                        className="embed-responsive-item"
                    />
                </div>
            </ModalBody>
        </Modal>
    );
}

SVSVideoModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
};

export default SVSVideoModal;
