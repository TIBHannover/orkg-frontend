import React from 'react';
import { Modal, ModalBody, ModalHeader, Table, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';

const HelpModal = props => {
    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>CSV import help</ModalHeader>

            <ModalBody>
                <Alert color="info">
                    <a href="https://gitlab.com/TIBHannover/orkg/orkg-pypi/snippets/1984764" target="_blank" rel="noopener noreferrer">
                        Download the CSV template
                    </a>{' '}
                    to get started
                </Alert>
                <p>
                    With the CSV import tool, it is possible to import papers in bulk to the ORKG. After uploading the CSV file, you will be able to
                    see how to data will be imported (in step 3). Before starting the actual import it is possible to first preview the data to ensure
                    it is read and formatted correctly.
                </p>
                <hr />
                <h2 className="h4">Formatting rules</h2>
                <p>The extracted table should be formatted in such a way that it adheres to the following rules:</p>
                <ul>
                    <li>
                        <strong>First row labels.</strong> Only the first row should contain the header labels (transpose the table if necessary,
                        reformat the table if necessary)
                    </li>
                    <li>
                        <strong>One paper per row.</strong> Each row should contain a single paper. It is not possible to use multiple rows to
                        describe the same paper. Merge information in the same cells if necessary
                    </li>
                </ul>
                <hr />
                <h2 className="h4">Header labels</h2>
                <p>Some predefined column labels are used to correctly add paper related data.</p>

                <h3 className="h6">
                    <em>Required columns</em>
                </h3>
                <ul>
                    <li>
                        <strong>paper:title</strong>
                        <br />
                        Title of the paper
                    </li>
                </ul>

                <h3 className="h6">
                    <em>Optional columns</em>
                </h3>
                <ul>
                    <li>
                        <strong>paper:authors</strong>
                        <br />
                        Paper authors, separated by a semicolon (e.g., Author 1; Author 2)
                    </li>

                    <li>
                        <strong>paper:publication_month</strong>
                        <br />
                        Numeric value of the publication month (e.g., 6 for June)
                    </li>

                    <li>
                        <strong>paper:publication_year</strong>
                        <br />
                        Numeric value of the publication year (e.g., 2020)
                    </li>

                    <li>
                        <strong>paper:research_field</strong>
                        <br />
                        Research field ID (e.g., R11 for the most general field: 'Research field', only existing fields can be used:{' '}
                        <Link to={reverse(ROUTES.RESOURCE, { id: 'R11' })} target="_blank">
                            view fields
                        </Link>
                        )
                    </li>

                    <li>
                        <strong>contribution:research_problem</strong>
                        <br />A research problem (e.g., Graph visualization)
                    </li>
                </ul>

                <h3 className="h6">
                    <em>Other columns</em>
                </h3>
                <p>
                    Additional paper data can be added in additional columns to the CSV. The label of the column will be used as predicate in the
                    ORKG. In case a header label is prefixed with resource:, a resource is created instead of a literal (e.g., resource:Location)
                </p>
                <hr />
                <h2 className="h4">CSV example</h2>
                <div style={{ overflowY: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                <th>paper:title</th>
                                <th>paper:authors</th>
                                <th>paper:publication_month</th>
                                <th>paper:publication_year</th>
                                <th>paper:research_field</th>
                                <th>contribution:research_problem</th>
                                <th>resource:location</th>
                                <th>value</th>
                                <th>approach</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Example paper title 1</td>
                                <td>Author 1; Author 2</td>
                                <td>1</td>
                                <td>2020</td>
                                <td>R11</td>
                                <td>Example problem</td>
                                <td>Berlin</td>
                                <td>237.23</td>
                                <td>We tried to measure...</td>
                            </tr>
                            <tr>
                                <td>Example paper title 2</td>
                                <td>Author 1; Author 2</td>
                                <td>6</td>
                                <td>2019</td>
                                <td>R11</td>
                                <td>Example problem</td>
                                <td>Hannover</td>
                                <td>12.2</td>
                                <td>For this study, the...</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </ModalBody>
        </Modal>
    );
};

HelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default HelpModal;
