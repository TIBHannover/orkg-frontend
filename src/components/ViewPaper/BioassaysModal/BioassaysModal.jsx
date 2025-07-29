import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useCSVReader } from 'react-papaparse';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FormFeedback, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { mutate } from 'swr';

import Button from '@/components/Ui/Button/Button';
import BioassaySelectItem from '@/components/ViewPaper/BioassaysModal/BioassaySelectItem';
import useBioassays from '@/components/ViewPaper/hooks/useBioassays';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { createResourceStatement, statementsUrl } from '@/services/backend/statements';
import { semantifyBioassays } from '@/services/orkgNlp/index';
import { setBioassayRawResponse, setBioassayText } from '@/slices/viewPaperSlice';

const BioassaysModal = ({ selectedResource, toggle, showDialog }) => {
    const dispatch = useDispatch();
    const { CSVReader } = useCSVReader();
    const [bioassaysTest, setBioassaysTest] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingDataFailed, setIsLoadingDataFailed] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitAlert, setSubmitAlert] = useState(null);
    const [assayData, setAssayData] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const { handleSaveBioassaysFeedback } = useBioassays({ selectedResource });

    const handleSubmitText = () => {
        setIsLoadingData(true);
        if (bioassaysTest === '') {
            setSubmitAlert('Nothing to submit. Please provide text in the input field');
            setIsLoadingData(false);
        } else {
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
                    toast.error('Error loading data.');
                });
        }
    };

    const handleSelect = (labelKey, value) => {
        if (selectedItems[labelKey.property.id]?.includes(value.id)) {
            setSelectedItems((prev) => ({ ...prev, [labelKey.property.id]: prev[labelKey.property.id].filter((id) => id !== value.id) }));
        } else {
            setSelectedItems((prev) => ({ ...prev, [labelKey.property.id]: [...(prev[labelKey.property.id] || []), value.id] }));
        }
    };

    const handleInsertData = () => {
        const apiCalls = [];
        for (const key of Object.keys(selectedItems)) {
            if (selectedItems[key].length > 0) {
                for (const value of selectedItems[key]) {
                    // Add the statements to the selected contribution
                    apiCalls.push(createResourceStatement(selectedResource, key, value));
                }
            }
        }
        Promise.all(apiCalls)
            .then(() => {
                // revalidate the cache of the selected contribution
                mutate([
                    {
                        subjectId: selectedResource,
                        returnContent: true,
                        returnFormattedLabels: true,
                    },
                    statementsUrl,
                    'getStatements',
                ]);
                setAssayData([]);
                setSelectedItems({});
                setIsSubmitted(false);
                handleSaveBioassaysFeedback({ selectedItems });
                toggle();
            })
            .catch(() => {
                toast.error('Error inserting data.');
            });
    };

    const PARSER_OPTIONS = {
        skipEmptyLines: true,
    };

    return (
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Semantification of Bioassays</ModalHeader>
            <ModalBody>
                {isLoadingData && (
                    <div className="text-center text-primary">
                        <span style={{ fontSize: 80 }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                        </span>
                        <br />
                        <h2 className="h5">Loading...</h2> <br />
                    </div>
                )}
                {!isSubmitted && !isLoadingData && (
                    <div>
                        <FormGroup>
                            <div className="custom-file mb-3">
                                <CSVReader
                                    accept=".txt"
                                    config={PARSER_OPTIONS}
                                    onUploadAccepted={(result) => setBioassaysTest(result.data.join('\n'))}
                                >
                                    {({ getRootProps, acceptedFile, ProgressBar }) => (
                                        <>
                                            <InputGroup>
                                                <Button {...getRootProps()}>Browse file</Button>
                                                <div
                                                    {...getRootProps()}
                                                    style={{
                                                        border: '1px solid #ccc',
                                                        lineHeight: 2.2,
                                                        paddingLeft: 10,
                                                        flexGrow: '1',
                                                    }}
                                                >
                                                    {acceptedFile && acceptedFile.name}
                                                    {!acceptedFile && 'Click to upload bioassay .txt file'}
                                                </div>
                                            </InputGroup>
                                            <ProgressBar style={{ backgroundColor: '#dbdde5' }} />
                                        </>
                                    )}
                                </CSVReader>
                            </div>
                            <Label for="bioassaysText">Enter the Bioassays</Label>
                            <Input
                                type="textarea"
                                id="bioassaysText"
                                className="pl-2 pr-2"
                                rows={8}
                                value={bioassaysTest}
                                placeholder="Copy a text into this form or use the upload button"
                                onChange={(e) => setBioassaysTest(e.target.value)}
                                invalid={!!submitAlert}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                            {!!submitAlert && <FormFeedback className="order-1">{submitAlert}</FormFeedback>}
                        </FormGroup>
                    </div>
                )}
                {!isLoadingDataFailed && isSubmitted && !isLoadingData && (
                    <BioassaySelectItem
                        selectedItems={selectedItems}
                        handleSelect={handleSelect}
                        data={assayData}
                        id={selectedResource}
                        selectionFinished={toggle}
                        loadingData={isLoadingData}
                    />
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    color="light"
                    onClick={() => {
                        setAssayData([]);
                        setIsSubmitted(false);
                        toggle();
                    }}
                    disabled={isLoadingData}
                >
                    Cancel
                </Button>
                <Button color="primary" onClick={isSubmitted ? handleInsertData : handleSubmitText} disabled={isLoadingData}>
                    {isSubmitted ? 'Insert data' : 'Submit'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};
BioassaysModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
};

export default BioassaysModal;
