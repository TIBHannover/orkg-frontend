import React from 'react';
import { Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import image from 'assets/img/help/survey1.png';
import image2 from 'assets/img/help/survey2.png';
import image3 from 'assets/img/help/survey3.png';
import image4 from 'assets/img/help/survey4.png';
import image5 from 'assets/img/help/survey5.png';
import image6 from 'assets/img/help/survey6.png';
import image7 from 'assets/img/help/survey7.png';

const HelpModal = props => {
    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>Survey table extraction help</ModalHeader>

            <ModalBody>
                <Alert color="warning">This is a beta feature, this functionality might be unstable</Alert>
                <p>
                    The with <em>Survey table extractor</em> it is possible to extract survey tables from PDF papers. The contents of those tables are
                    used to add papers to the ORKG. In this tutorial we explain how to use this functionality.
                </p>
                <hr />
                <h4 className="mt-4">What are survey tables?</h4>
                <p>
                    Survey tables present information found in other papers, they are often presented in survey or review articles. Because the tables
                    present information in a structure way, they can be used to quickly generate structured descriptions of those papers. Survey
                    tables also contain references to the papers that are reviewed, based on the reference a description is generated for the
                    referenced paper. Two examples of survey tables (note the references):{' '}
                </p>
                <div className="text-center">
                    <img src={image} alt="Example of a survey table" style={{ width: 340 }} />
                    <img src={image2} alt="Second example of a survey table" style={{ width: 400 }} />
                </div>
                <Alert color="info" className="mt-3">
                    In case a table doesn't contain references, you cannot use this tool to import the table
                </Alert>
                <hr />
                <h4 className="mt-4">How to import survey tables?</h4>
                <h5 className="mt-3">1. Upload the PDF and select the table</h5>
                <p>
                    First upload your PDF file to the tool. Afterwards, select the region of the table you want to import. Click the{' '}
                    <em>Extract table</em> button to extract the table from the PDF. Table extraction from PDFs is a complicated process, the
                    extracted table might contain errors which should be fixed manually.
                </p>
                <div className="text-center">
                    <img src={image3} alt="Select table within the PDF" style={{ width: 300 }} />
                </div>
                <h5>2. Format the extracted table</h5>
                <p>The extracted table should be formatted in such a way that it adheres to the following rules:</p>
                <ul>
                    <li>
                        <strong>First row labels.</strong> Only the first row should contain the header labels (transpose the table if necessary,
                        reformat the table if necessary)
                    </li>
                    <li>
                        <strong>One paper per row.</strong> Each row should contain a single paper. It is not possible to use multiple rows to
                        describe the same paper. Merge information in the same cells if necessary (to click to do, right click on multiple cells, and
                        click "Merge cell values")
                    </li>
                </ul>
                <div className="text-center">
                    <img src={image4} alt="Fix the formatting of the table after extraction" style={{ width: 700 }} />
                </div>

                <h5>3. Map header labels</h5>
                <p>
                    The header labels should be mapped to ORKG properties. This means that for each header label, you have to select or create an ORKG
                    property. Do this by double clicking the header label, and selecting a property. In case a property does not exist, click "Create{' '}
                    <em>property name</em>".
                </p>
                <div className="text-center">
                    <img src={image5} alt="Map the header labels to existing properties" />
                </div>
                <h5>4. Extract references</h5>
                <p>
                    The final step is to extract the references used in the table. In this step, the related metadata for each references is captured.
                    This includes the title, authors and publication date. To extract the references, click the <em>Extract references button</em>. In
                    the popup that opens, select the column in which the references are used. Also, you can selected the references formatting/style.
                </p>
                <div className="text-center mb-4">
                    <img src={image6} alt="Extract references button" style={{ width: 300, marginRight: 20 }} />
                    <img src={image7} alt="Extract references dialog" style={{ width: 400 }} />
                </div>
                <p>When the reference extraction is performed, 7 new columns are added to the table:</p>

                <ul>
                    <li>
                        <strong>paper:title</strong>
                        <br /> this is a <strong>required</strong> column, each row should contain a paper title. In case the automatic extraction
                        wasn't able to extract all references automatically, please add the metadata yourself. That means, go to the original paper,
                        and copy the reference information into the respective columns. Rows that don't have a paper title, won't be imported.
                    </li>
                    <li>
                        <strong>paper:authors</strong>
                        <br /> contains the author names. Separate the individual authors by a semicolon (;)
                    </li>
                    <li>
                        <strong>paper:publication_month</strong>
                        <br /> often cannot be automatically extracted. Add the months manually, or just remove the column.
                    </li>
                    <li>
                        <strong>paper:publication_year</strong>
                        <br /> contains the year of publication.
                    </li>
                    <li>
                        <strong>paper:doi</strong>
                        <br /> contains the paper DOIs.
                    </li>
                    <li>
                        <strong>paper:research_field</strong>
                        <br /> can be selected by double clicking on the cell. It is not possible to create a new research field. Tip: use the same
                        research field for all rows to save time.
                    </li>
                    <li>
                        <strong>contribution:research_problem</strong>
                        <br /> is a textual description of that problem that the listed papers address. The problem normally consists of 2-3 words,
                        but more words are allowed. Tip: use the same research problem for all rows to save time.
                    </li>
                </ul>
                <p>
                    When all cells are filled out, click the <em>Import data</em> button to start the import.
                </p>
            </ModalBody>
        </Modal>
    );
};

HelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default HelpModal;
