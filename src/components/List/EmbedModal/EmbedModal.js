import { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalBody, Alert, ModalHeader, Button, Input, FormGroup, Label, Row, Col } from 'reactstrap';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { toast } from 'react-toastify';
import env from '@beam-australia/react-env';
import ROUTES from 'constants/routes';
import CopyToClipboard from 'react-copy-to-clipboard';
import Tippy from '@tippyjs/react';

function EmbedModal({ isOpen, toggle, id }) {
    const [width, setWidth] = useState('600px');
    const list = useSelector(state => state.list.list);
    const isPublished = useSelector(state => state.list.isPublished);
    const title = `ORKG list - ${list?.title}`;
    const src = `${env('URL')}${reverse(ROUTES.LIST, {
        id,
        embed: 'embed'
    }).replace('/', '', 1)}`;

    const code = `<iframe src="${src}"  width="${width}" height="480px" title="${title}"/>`;

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="xl">
            <ModalHeader toggle={toggle}>Embed list</ModalHeader>
            <ModalBody>
                {isPublished ? (
                    <>
                        <FormGroup>
                            <Label for="embed-code">Code to embed</Label>
                            <div className="position-relative">
                                <Tippy content="Copy to clipboard">
                                    <div className="float-end position-absolute" style={{ right: 4, top: 4 }}>
                                        <CopyToClipboard
                                            text={code}
                                            onCopy={() => {
                                                toast.success(`Copied to clipboard`);
                                            }}
                                        >
                                            <Button color="primary" className="ps-3 pe-3" size="sm">
                                                <Icon icon={faClipboard} />
                                            </Button>
                                        </CopyToClipboard>
                                    </div>
                                </Tippy>
                                <Input id="embed-code" type="textarea" value={code} disabled />
                            </div>
                        </FormGroup>
                        <Row>
                            <Col md={6}>
                                <FormGroup>
                                    <Label for="iframe-width">Width</Label>
                                    <Input id="iframe-width" name="select" type="select" value={width} onChange={e => setWidth(e.target.value)}>
                                        <option value="400px">Small</option>
                                        <option value="600px">Medium</option>
                                        <option value="800px">Large</option>
                                        <option value="100%">100%</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>
                        <hr />
                        <h3 className="h5 mt-4">Preview</h3>
                        <div className="d-flex justify-content-center">
                            <iframe
                                width={width}
                                height="480"
                                src={src}
                                style={{ border: '3px solid', borderRadius: '5px', transition: '0.5s' }}
                                title={title}
                            />
                        </div>
                    </>
                ) : (
                    <Alert color="danger">You cannot embed an unpublished list</Alert>
                )}
            </ModalBody>
        </Modal>
    );
}

EmbedModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
};

export default EmbedModal;
