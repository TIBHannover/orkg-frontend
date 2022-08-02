import { faCalendar, faLink, faUser, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { downloadJPG, downloadPDF } from 'libs/GoogleChartDownloadFunctions';
import {
    Badge,
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    UncontrolledPopover,
    PopoverHeader,
    PopoverBody,
    Form,
    FormGroup,
    Input,
    Label,
} from 'reactstrap';

const ViewVisualizationModal = ({ isOpen, toggle, data, onEditVisualization }) => {
    const handleEditVisualization = () => {
        onEditVisualization();
        toggle();
    };

    const [chartToDownload, setChartWrapper] = useState(null);

    let [selectedFileFormat, selectFileFormat] = useState('JPGformat');
    let [caption, enableCaption] = useState(true);

    const downloadChart = chart => {
        if (selectedFileFormat === 'JPGformat') downloadJPG(chart, data.label);
        else if (selectedFileFormat === 'PDFformat') downloadPDF(chart, data.label);
    };

    const initChartDownload = () => {
        setChartWrapper(
            <GDCVisualizationRenderer
                caption={caption ? data.label : undefined}
                width="1000px"
                height="500px"
                model={data.reconstructionModel}
                downloadChart={downloadChart}
            />,
        );
    };

    return (
        <Modal size="lg" isOpen={isOpen} toggle={toggle} style={{ maxWidth: '90%' }}>
            <ModalHeader toggle={toggle}>View visualization</ModalHeader>
            <ModalBody>
                <div className="d-flex">
                    <h5>{data.label ?? 'No Title'}</h5>
                    <Tippy content="Go to resource page">
                        <Link target="_blank" className="ms-2 resourceLink" to={reverse(ROUTES.RESOURCE, { id: data.id })}>
                            <Icon icon={faLink} className="text-primary" />
                        </Link>
                    </Tippy>
                </div>
                {data.description ?? 'No Description'}
                <div className="mt-2">
                    <Badge color="light" className="me-2">
                        <Icon icon={faCalendar} className="text-primary" /> {data.created_at ? moment(data.created_at).format('DD MMMM YYYY') : ''}
                    </Badge>
                    {data.authors &&
                        data.authors.length > 0 &&
                        data.authors.map(author => {
                            if (author && author.class === ENTITIES.RESOURCE) {
                                return (
                                    <Link
                                        className="d-inline-block me-2 mb-2"
                                        to={reverse(ROUTES.AUTHOR_PAGE, { authorId: author.id })}
                                        key={`author${author.id}`}
                                    >
                                        <Badge color="light">
                                            <Icon icon={faUser} className="text-primary" /> {author.label}
                                        </Badge>
                                    </Link>
                                );
                            }
                            return (
                                <Badge key={`author${author.id}`} color="light" className="me-2 mb-2">
                                    <Icon icon={faUser} /> {author.label}
                                </Badge>
                            );
                        })}
                </div>
                <hr />
                <GDCVisualizationRenderer height="500px" model={data.reconstructionModel} />
                <div
                    id="google-chart-rendered"
                    style={{
                        position: 'absolute',
                        opacity: 0,
                        pointerEvents: 'none',
                    }}
                >
                    {chartToDownload}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button id="PopoverLegacy" type="button">
                    Export
                </Button>
                <UncontrolledPopover placement="bottom" target="PopoverLegacy" trigger="legacy">
                    <PopoverHeader>Chart export</PopoverHeader>
                    <PopoverBody>
                        <Form>
                            <FormGroup
                                onChange={({ target }) => {
                                    selectFileFormat(target.value);
                                }}
                            >
                                <legend style={{ fontSize: '1rem' }}>File format</legend>
                                <FormGroup check inline>
                                    <Input defaultChecked id="JPGformat" value="JPGformat" type="radio" name="fileFormat" />
                                    <Label for="JPGformat" check>
                                        JPG
                                    </Label>
                                </FormGroup>
                                <FormGroup check inline>
                                    <Input id="PDFformat" type="radio" name="fileFormat" value="PDFformat" />
                                    <Label for="PDFformat" check>
                                        PDF
                                    </Label>
                                </FormGroup>
                            </FormGroup>
                            <FormGroup>
                                <FormGroup check inline>
                                    <Label for="caption-ins" check>
                                        Enable caption
                                    </Label>
                                    <Input
                                        onChange={({ target }) => {
                                            enableCaption(target.checked);
                                        }}
                                        defaultChecked
                                        id="caption-ins"
                                        type="checkbox"
                                        name="caption-ins"
                                    />
                                </FormGroup>
                            </FormGroup>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    onClick={e => {
                                        e.preventDefault();
                                        initChartDownload();
                                    }}
                                >
                                    Export
                                </Button>
                            </div>
                        </Form>
                    </PopoverBody>
                </UncontrolledPopover>
                <Button onClick={handleEditVisualization} color="light">
                    Edit visualization
                </Button>
                <Button onClick={toggle} color="primary">
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ViewVisualizationModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onEditVisualization: PropTypes.func.isRequired,
    data: PropTypes.object,
};

export default ViewVisualizationModal;
