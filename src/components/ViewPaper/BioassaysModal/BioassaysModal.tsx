import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal, toast } from '@heroui/react';
import { FC, useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { useDispatch } from 'react-redux';
import { mutate } from 'swr';

import BioassaySelectItem from '@/components/ViewPaper/BioassaysModal/BioassaySelectItem';
import useBioassays from '@/components/ViewPaper/hooks/useBioassays';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createResourceStatement, statementsUrl } from '@/services/backend/statements';
import { semantifyBioassays } from '@/services/orkgNlp/index';
import { setBioassayRawResponse, setBioassayText } from '@/slices/viewPaperSlice';

type BioassayLabel = {
    property: { id: string; label: string };
    resources: { id: string; label: string }[];
};

type BioassayData = { labels: BioassayLabel[] };

type BioassaysModalProps = {
    showDialog: boolean;
    toggle: () => void;
    selectedResource: string;
};

const BioassaysModal: FC<BioassaysModalProps> = ({ selectedResource, toggle, showDialog }) => {
    const dispatch = useDispatch();
    const { CSVReader } = useCSVReader();
    const [bioassaysTest, setBioassaysTest] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingDataFailed, setIsLoadingDataFailed] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitAlert, setSubmitAlert] = useState<string | null>(null);
    const [assayData, setAssayData] = useState<BioassayData>({ labels: [] });
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
    const { handleSaveBioassaysFeedback } = useBioassays({ selectedResource });

    const handleSubmitText = () => {
        setIsLoadingData(true);
        if (bioassaysTest === '') {
            setSubmitAlert('Nothing to submit. Please provide text in the input field');
            setIsLoadingData(false);
            return;
        }
        setSubmitAlert(null);
        setIsSubmitted(true);
        semantifyBioassays(bioassaysTest)
            .then((result) => {
                const data = result.payload;
                dispatch(setBioassayRawResponse(data.labels));
                dispatch(setBioassayText(bioassaysTest));
                if (data.labels.length) {
                    setAssayData(data);
                    setIsLoadingData(false);
                    setIsLoadingDataFailed(false);
                } else {
                    setAssayData(data);
                    setSubmitAlert('No resources or properties found in this Bioassays');
                    setIsLoadingData(false);
                    setIsSubmitted(false);
                    setIsLoadingDataFailed(false);
                }
            })
            .catch(() => {
                setIsSubmitted(false);
                setIsLoadingData(false);
                setIsLoadingDataFailed(true);
                toast.danger('Error loading data.');
            });
    };

    const handleSelect = (labelKey: BioassayLabel, value: { id: string }) => {
        if (selectedItems[labelKey.property.id]?.includes(value.id)) {
            setSelectedItems((prev) => ({ ...prev, [labelKey.property.id]: prev[labelKey.property.id].filter((id) => id !== value.id) }));
        } else {
            setSelectedItems((prev) => ({ ...prev, [labelKey.property.id]: [...(prev[labelKey.property.id] || []), value.id] }));
        }
    };

    const handleInsertData = () => {
        const apiCalls: Promise<unknown>[] = [];
        for (const key of Object.keys(selectedItems)) {
            if (selectedItems[key].length > 0) {
                for (const value of selectedItems[key]) {
                    apiCalls.push(createResourceStatement(selectedResource, key, value));
                }
            }
        }
        Promise.all(apiCalls)
            .then(() => {
                mutate([
                    {
                        subjectId: selectedResource,
                        returnContent: true,
                        returnFormattedLabels: true,
                    },
                    statementsUrl,
                    'getStatements',
                ]);
                setAssayData({ labels: [] });
                setSelectedItems({});
                setIsSubmitted(false);
                handleSaveBioassaysFeedback({ selectedItems });
                toggle();
            })
            .catch(() => {
                toast.danger('Error inserting data.');
            });
    };

    const PARSER_OPTIONS = {
        skipEmptyLines: true,
    };

    return (
        <Modal.Backdrop
            isOpen={showDialog}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable={!isLoadingData}
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-2xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Semantification of Bioassays</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6">
                        {isLoadingData && (
                            <div className="text-center text-accent">
                                <FontAwesomeIcon icon={faSpinner} spin className="text-6xl" />
                                <h2 className="text-xl mt-3">Loading...</h2>
                            </div>
                        )}
                        {!isSubmitted && !isLoadingData && (
                            <div className="flex flex-col gap-4">
                                <CSVReader
                                    accept=".txt"
                                    config={PARSER_OPTIONS}
                                    onUploadAccepted={(result: { data: string[] }) => setBioassaysTest(result.data.join('\n'))}
                                >
                                    {({
                                        getRootProps,
                                        acceptedFile,
                                        ProgressBar,
                                    }: {
                                        getRootProps: () => Record<string, unknown>;
                                        acceptedFile?: File;
                                        ProgressBar: FC<{ style?: React.CSSProperties }>;
                                    }) => (
                                        <>
                                            <div className="flex h-9 items-stretch">
                                                <Button {...getRootProps()} size="sm" className="!h-9 !rounded-e-none">
                                                    Browse file
                                                </Button>
                                                <div
                                                    {...getRootProps()}
                                                    className="grow flex items-center px-3 text-sm rounded-e-md border border-border -ms-px bg-field-background text-field-foreground cursor-pointer"
                                                >
                                                    {acceptedFile ? acceptedFile.name : 'Click to upload bioassay .txt file'}
                                                </div>
                                            </div>
                                            <ProgressBar style={{ backgroundColor: 'var(--border)' }} />
                                        </>
                                    )}
                                </CSVReader>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="bioassaysText" className="text-sm font-medium">
                                        Enter the Bioassays
                                    </label>
                                    <textarea
                                        id="bioassaysText"
                                        aria-label="Bioassays text"
                                        rows={8}
                                        value={bioassaysTest}
                                        placeholder="Copy a text into this form or use the upload button"
                                        onChange={(e) => setBioassaysTest(e.target.value)}
                                        maxLength={MAX_LENGTH_INPUT}
                                        className={`w-full px-3 py-2 rounded-md border bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus/40 ${
                                            submitAlert ? 'border-danger' : 'border-border'
                                        }`}
                                    />
                                    {!!submitAlert && <small className="text-danger">{submitAlert}</small>}
                                </div>
                            </div>
                        )}
                        {!isLoadingDataFailed && isSubmitted && !isLoadingData && (
                            <BioassaySelectItem selectedItems={selectedItems} handleSelect={handleSelect} data={assayData} />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="ghost"
                            onPress={() => {
                                setAssayData({ labels: [] });
                                setIsSubmitted(false);
                                toggle();
                            }}
                            isDisabled={isLoadingData}
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" onPress={isSubmitted ? handleInsertData : handleSubmitText} isDisabled={isLoadingData}>
                            {isSubmitted ? 'Insert data' : 'Submit'}
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default BioassaysModal;
