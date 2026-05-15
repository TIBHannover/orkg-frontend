import { faCalendar, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Chip, Modal, Popover, Radio, RadioGroup, Separator, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, ReactNode, useState } from 'react';
import useSWR from 'swr';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ROUTES from '@/constants/routes';
import THING_TYPES from '@/constants/thingTypes';
import { reverse } from '@/lib/namedRoute';
import { downloadJPG, downloadPDF } from '@/libs/googleChartDownloadFunctions';
import GDCVisualizationRenderer from '@/libs/selfVisModel/RenderingComponents/GDCVisualizationRenderer';
import { getVisualization, visualizationsUrl } from '@/services/backend/visualizations';
import { getThing, simCompServiceUrl } from '@/services/simcomp';

type ViewVisualizationModalProps = {
    isOpen: boolean;
    toggle: () => void;
    id: string;
};

const ViewVisualizationModal: FC<ViewVisualizationModalProps> = ({ isOpen, toggle, id }) => {
    const { data: visualization } = useSWR(isOpen ? [id, visualizationsUrl, 'getVisualization'] : null, ([_id]) => getVisualization(_id));
    const { data: reconstructionModel } = useSWR(isOpen ? [id, simCompServiceUrl, 'getVisualization'] : null, ([_id]) =>
        getThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: _id }),
    );

    const [chartToDownload, setChartToDownload] = useState<ReactNode>(null);
    const [selectedFileFormat, setSelectedFileFormat] = useState('JPGformat');
    const [caption, enableCaption] = useState(true);

    if (!visualization || !reconstructionModel) {
        return null;
    }

    const downloadChart = (chart: unknown) => {
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog className="max-w-[90%]">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>View visualization</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        <div className="flex items-center">
                            <span className="text-lg font-semibold">{visualization.title ?? 'No Title'}</span>
                            <Tooltip delay={0}>
                                <Tooltip.Trigger>
                                    <Link target="_blank" className="ml-2" href={`${reverse(ROUTES.RESOURCE, { id: visualization.id })}?noRedirect`}>
                                        <FontAwesomeIcon icon={faLink} className="text-accent" />
                                    </Link>
                                </Tooltip.Trigger>
                                <Tooltip.Content showArrow>
                                    <Tooltip.Arrow />
                                    Go to resource page
                                </Tooltip.Content>
                            </Tooltip>
                        </div>
                        {visualization.description ?? 'No Description'}
                        <div className="mt-2">
                            <Chip color="default" className="mr-2 mb-2">
                                <FontAwesomeIcon icon={faCalendar} className="text-accent" />{' '}
                                {visualization.created_at ? dayjs(visualization.created_at).format('DD MMMM YYYY') : ''}
                            </Chip>
                            <AuthorBadges authors={visualization.authors} />
                        </div>
                        <Separator className="my-4" />
                        <GDCVisualizationRenderer height="500px" model={reconstructionModel} />
                        <div id="google-chart-rendered" className="absolute pointer-events-none opacity-0">
                            {chartToDownload}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Popover>
                            <Popover.Trigger>
                                <Button variant="secondary">Export</Button>
                            </Popover.Trigger>
                            <Popover.Content placement="top">
                                <Popover.Dialog>
                                    <Popover.Heading>Chart export</Popover.Heading>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <div className="text-sm mb-1">File format</div>
                                            <RadioGroup
                                                value={selectedFileFormat}
                                                onChange={(value) => setSelectedFileFormat(value)}
                                                orientation="horizontal"
                                            >
                                                <Radio value="JPGformat">
                                                    <Radio.Control>
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content>JPG</Radio.Content>
                                                </Radio>
                                                <Radio value="PDFformat">
                                                    <Radio.Control>
                                                        <Radio.Indicator />
                                                    </Radio.Control>
                                                    <Radio.Content>PDF</Radio.Content>
                                                </Radio>
                                            </RadioGroup>
                                        </div>
                                        <Checkbox isSelected={caption} onChange={(checked) => enableCaption(checked)}>
                                            <Checkbox.Control>
                                                <Checkbox.Indicator />
                                            </Checkbox.Control>
                                            <Checkbox.Content>Enable caption</Checkbox.Content>
                                        </Checkbox>
                                        <div className="text-center">
                                            <Button onPress={initChartDownload} size="sm">
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                </Popover.Dialog>
                            </Popover.Content>
                        </Popover>
                        <Button onPress={toggle}>Close</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ViewVisualizationModal;
