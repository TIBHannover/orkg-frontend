import { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup, FormFeedback, Input } from 'reactstrap';
import { semantifyBioassays } from 'services/orkgNlp/index';
import CsvReader from 'react-csv-reader';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { fillStatements } from 'slices/statementBrowserSlice';
import { setNerRawResponse } from 'slices/addPaperSlice';
import { useDispatch, useSelector } from 'react-redux';
import BioassaySelectItem from './BioassaySelectItem';

const BioAssaysModal = props => {
    const dispatch = useDispatch();
    const resourceId = useSelector(state =>
        state.addPaper.contributions.byId[props.selectedResource] ? state.addPaper.contributions.byId[props.selectedResource].resourceId : null,
    );

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
                    dispatch(setNerRawResponse(data.labels));
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
                .catch(e => {
                    setIsSubmitted(false);
                    setIsLoadingData(false);
                    setIsLoadingDataFailed(true);
                    toast.error('Error loading data.');
                });
        }
    };

    const handleSelect = (labelKey, value) => {
        if (selectedItems[labelKey.property.id] && selectedItems[labelKey.property.id].includes(value.id)) {
            setSelectedItems(prev => ({ ...prev, [labelKey.property.id]: prev[labelKey.property.id].filter(id => id !== value) }));
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
                                <CsvReader
                                    cssClass="csv-reader-input"
                                    cssInputClass="form-control"
                                    accept=".txt"
                                    onFileLoaded={(data, fileInfo) => setBioassaysTest(data.join('\n'))}
                                    parserOptions={{
                                        skipEmptyLines: true,
                                    }}
                                    inputStyle={{ cursor: 'pointer' }}
                                />
                                <label className="custom-file-label" htmlFor="exampleCustomFileBrowser">
                                    Click to upload bioassay .txt file
                                </label>
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
                    {isSubmitted ? 'Insert Data' : 'Submit'}
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
