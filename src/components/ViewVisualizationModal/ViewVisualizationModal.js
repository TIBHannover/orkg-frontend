import { faCalendar, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import dayjs from 'dayjs';
import { downloadJPG, downloadPDF } from 'libs/googleChartDownloadFunctions';
import GDCVisualizationRenderer from 'libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useState } from 'react';
import {
    Badge,
    Button,
    Form,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    PopoverBody,
    PopoverHeader,
    UncontrolledPopover,
} from 'reactstrap';
import { getVisualization, visualizationsUrl } from 'services/backend/visualizations';
import { getThing, simCompServiceUrl } from 'services/simcomp';
import useSWR from 'swr';

const ViewVisualizationModal = ({ isOpen, toggle, id }) => {
    const { data: visualization } = useSWR([id, visualizationsUrl, 'getVisualization'], ([id]) => getVisualization(id));
    const { data: reconstructionModel } = useSWR([id, simCompServiceUrl, 'getVisualization'], ([id]) =>
        getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: id }),
    );

    const [chartToDownload, setChartToDownload] = useState(null);

    const [selectedFileFormat, setSelectedFileFormat] = useState('JPGformat');
    const [caption, enableCaption] = useState(true);

    if (!visualization || !reconstructionModel) {
        return null;
    }

    const downloadChart = (chart) => {
        if (selectedFileFormat === 'JPGformat') downloadJPG(chart, visualization.title);
        else if (selectedFileFormat === 'PDFformat') downloadPDF(chart, visualization.title);
        setChartToDownload(null);
    };

    const initChartDownload = () => {
        setChartToDownload(
            <GDCVisualizationRenderer
                caption={caption ? visualization.title : undefined}
                width="1000px"
                height="500px"
                model={reconstructionModel}
                downloadChart={downloadChart}
            />,
        );
    };

    return (
        <Modal size="lg" isOpen={isOpen} toggle={toggle} style={{ maxWidth: '90%' }}>
            <ModalHeader toggle={toggle}>View visualization</ModalHeader>
            <ModalBody>
                <div className="d-flex">
                    <h5>{visualization.title ?? 'No Title'}</h5>
                    <Tippy content="Go to resource page">
                        <Link target="_blank" className="ms-2 resourceLink" href={`${reverse(ROUTES.RESOURCE, { id: visualization.id })}?noRedirect`}>
                            <FontAwesomeIcon icon={faLink} className="text-primary" />
                        </Link>
                    </Tippy>
                </div>
                {visualization.description ?? 'No Description'}
                <div className="mt-2">
                    <Badge color="light" className="me-2">
                        <FontAwesomeIcon icon={faCalendar} className="text-primary" />{' '}
                        {visualization.created_at ? dayjs(visualization.created_at).format('DD MMMM YYYY') : ''}
                    </Badge>
                    <AuthorBadges authors={visualization.authors} />
                </div>
                <hr />
                <GDCVisualizationRenderer height="500px" model={reconstructionModel} />
                <div
                    id="google-chart-rendered"
                    className="position-absolute pe-none"
                    style={{
                        opacity: 0,
                    }}
                >
                    {chartToDownload}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button id="popover-download-visualization" color="light">
                    Export
                </Button>
                <UncontrolledPopover placement="top" target="popover-download-visualization" trigger="legacy" fade={false}>
                    <PopoverHeader>Chart export</PopoverHeader>
                    <PopoverBody>
                        <Form>
                            <FormGroup onChange={({ target }) => setSelectedFileFormat(target.value)}>
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
                            <div className="text-center">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        initChartDownload();
                                    }}
                                    size="sm"
                                >
                                    Download
                                </Button>
                            </div>
                        </Form>
                    </PopoverBody>
                </UncontrolledPopover>

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
    id: PropTypes.string.isRequired,
};

export default ViewVisualizationModal;
