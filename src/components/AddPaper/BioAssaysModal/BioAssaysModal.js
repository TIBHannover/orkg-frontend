import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, FormFeedback, Input, InputGroup } from 'reactstrap';
import { semantifyBioassays } from 'services/orkgNlp/index';
import { useCSVReader } from 'react-papaparse';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fillStatements } from 'slices/statementBrowserSlice';
import { setBioassayRawResponse, setBioassayText } from 'slices/addPaperSlice';
import { useDispatch, useSelector } from 'react-redux';
import BioassaySelectItem from './BioassaySelectItem';

const BioAssaysModal = props => {
    const dispatch = useDispatch();
    const resourceId = useSelector(state =>
        state.addPaper.contributions.byId[props.selectedResource] ? state.addPaper.contributions.byId[props.selectedResource].resourceId : null,
    );
    const { CSVReader } = useCSVReader();
    const [bioassaysTest, setBioassaysTest] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isLoadingDataFailed, setIsLoadingDataFailed] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitAlert, setSubmitAlert] = useState(null);
    const [assayData, setAssayData] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});

    const handleSubmitText = () => {
        setIsLoadingData(true);
        if (bioassaysTest === '') {
            setSubmitAlert('Nothing to submit. Please provide text in the input field');
            setIsLoadingData(false);
        } else {
            setSubmitAlert(null);
            setIsSubmitted(true);
            semantifyBioassays(bioassaysTest)
                .then(result => {
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
            setSelectedItems(prev => ({ ...prev, [labelKey.property.id]: prev[labelKey.property.id].filter(id => id !== value.id) }));
        } else {
            setSelectedItems(prev => ({ ...prev, [labelKey.property.id]: [...(prev[labelKey.property.id] || []), value.id] }));
        }
    };

    const createStatementIdObject = () => {
        // append list values as strings
        const statements = { properties: [], values: [] };
        for (const key of Object.keys(selectedItems)) {
            if (selectedItems[key].length > 0) {
                const label = assayData.labels.find(l => l.property.id === key);
                statements.properties.push({
                    existingPredicateId: label.property.id,
                    propertyId: label.property.id,
                    label: label.property.label,
                });

                for (const value of selectedItems[key]) {
                    const val = label.resources.find(v => v.id === value);
                    statements.values.push({
                        label: val.label,
                        type: 'object',
                        existingResourceId: val.id,
                        isExistingValue: true,
                        propertyId: label.property.id,
                    });
                }
            }
        }
        return statements;
    };

    const handleInsertData = () => {
        const statements = createStatementIdObject();
        // insert into statement Browser
        dispatch(
            fillStatements({
                statements,
                resourceId,
            }),
        );
        setAssayData([]);
        setSelectedItems({});
        setIsSubmitted(false);
        props.toggle();
    };

    const PARSER_OPTIONS = {
        skipEmptyLines: true,
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Semantification of Bioassays</ModalHeader>
            <ModalBody>
                {isLoadingData && (
                    <div className="text-center text-primary">
                        <span style={{ fontSize: 80 }}>
                            <Icon icon={faSpinner} spin />
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
                                    onUploadAccepted={result => setBioassaysTest(result.data.join('\n'))}
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
                                onChange={e => setBioassaysTest(e.target.value)}
                                invalid={!!submitAlert}
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
                        id={props.selectedResource}
                        selectionFinished={props.toggle}
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
                        props.toggle();
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
BioAssaysModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
};

export default BioAssaysModal;
