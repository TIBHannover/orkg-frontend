import React from 'react';
import { Alert, Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import image from 'assets/img/help/template1.png';
import image2 from 'assets/img/help/template2.png';
import image3 from 'assets/img/help/template3.png';
import styled from 'styled-components';

const Image = styled.img`
    border: 3px solid grey;
    margin: 10px 5px;
`;

const HelpModal = props => {
    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>Template editor help</ModalHeader>

            <ModalBody>
                <Alert color="warning">This is a beta feature, this functionality might be unstable</Alert>
                <p>
                    Templates define a structure for research contributions addressing the same research problem. It allows to quickly add structure
                    to contribution data and illustrates the data structure required to make the contribution comparable to other contributions.
                </p>
                <p>
                    The template editor is used to define data structures and could help saving time when creating a contribution. Once the structure
                    is defined, the user only has to fill out the blanks to add a contribution.
                </p>
                <p>
                    In this guide we will follow a template use case in the engineering research field, where we want to define a template for
                    describing a House, using some of its properties like the number of rooms, building start date, location, and the electricity
                    provider company.
                </p>
                <p>
                    Creating a template is a process that is grounded in this three questions:
                    <ul>
                        <li>What are the use cases of the template?</li>
                        <li>What are the properties of the term that you want to define?</li>
                        <li>
                            How do we call its <abbr title="A resource that uses the template">instance</abbr>?
                        </li>
                    </ul>
                    Each of these questions has its own tab respectively: Description, Properties, Format.
                </p>
                <div className="text-center">
                    <Image src={image} alt="Template editor tabs" style={{ height: 50 }} />
                </div>
                <hr />
                <h4 className="mt-4">1. Description Tab</h4>
                <p>
                    Here we specify general information about the template:
                    <ul>
                        <li>
                            <b>Name</b>: the label that helps users to recognize the template. In our example, we call it “House”.
                        </li>

                        <li>
                            <b>Target Class</b>: we specify that all instances of this template will be an instance of this class and they must be
                            validated with the same structure. If not specified, a class is generated automatically.
                        </li>

                        <li>
                            <b>Property</b>: is used to link the contribution resource to the template instance. Remember that we are defining a graph
                            structure and that will be an edge (or link) that goes from the contribution resource to the template instance. And this
                            property will be used as a label of that edge.
                            <br />
                            <Alert className="mt-2" color="info">
                                If you want to link each property of this template directly to the contribution resource you can use ‘Has
                                contribution’ property in this field.
                            </Alert>
                        </li>

                        <li>
                            <b>Research fields and Research Problem</b>: specify the research fields or the research problem where this template can
                            be useful.
                        </li>
                    </ul>
                </p>
                <hr />
                <h4 className="mt-4">2. Properties Tab</h4>
                <p>
                    Here we specify the input fields that users need to feel out, We can specify the accepted values and the cardinality for each
                    field.
                </p>
                <p>
                    For our example, we are going to add these properties and we assume that all the cardinalities are Exactly one:
                    <ul>
                        <li>
                            <em>Number of rooms</em> of type <b>Number</b>
                        </li>
                        <li>
                            <em>Building start date</em> of type <b>Date</b>
                        </li>
                        <li>
                            <em>Location</em> of type <b>dc:Location</b> (Using this type, ORKG will automatically suggest locations from GeoNames
                            service for this input field)
                        </li>
                        <li>
                            <em>Electricity provider </em> of type <b>Company</b>
                        </li>
                    </ul>
                    We can go further and define more properties and we can also define a template for the type Company (i.e., nested templates).
                </p>
                <div className="text-center">
                    <Image src={image2} alt="Property Number of rooms" style={{ height: 150 }} />
                </div>
                <ul>
                    <li>
                        <b>Strict</b>: Whether we allow users of the template to add additional properties. In our case, we might keep it disabled
                        because users might want to define more properties for the house template.
                    </li>
                </ul>
                <hr />
                <h4 className="mt-4">3. Format Tab</h4>
                <p>
                    Some templates don’t require you to enter a label for its instances, and this feature allows you to generate a label based on its
                    description. In our case, we don’t need the user to type a name for each house he wants to define. For that, we can activate the
                    formatted label option and we generate a label having this format:
                </p>
                <p>
                    <i>{'{Number_of_rooms}'}</i> rooms in <i>{'{Location}'}</i> <i>{'({Building_start_Date})'}</i>{' '}
                </p>
                <div className="text-center">
                    <Image src={image3} alt="Formatted label of home template" style={{ height: 250 }} />
                </div>
                <p>And if house instance of 3 rooms build in 12/12/2012 and located in Berlin it will appear in the user interface as :</p>
                <p>3 rooms in Berlin (12/12/2012)</p>
                <hr />
                <p>
                    After adding all needed properties and configuration for the data structure, click the <i>Save</i> button to save the template.
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
