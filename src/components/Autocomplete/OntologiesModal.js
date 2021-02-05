import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { olsBaseUrl } from 'network';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import PropTypes from 'prop-types';

function OntologiesModal(props) {
    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Select ontology</ModalHeader>
            <ModalBody>
                Please select ontologies from the list below:
                <div className="my-3">
                    <AutoComplete
                        requestUrl={olsBaseUrl}
                        onChange={(selected, action) => {
                            // blur the field allows to focus and open the menu again
                            props.setSelectedOntologies(selected ? selected : []);
                        }}
                        placeholder="Select or type to enter an ontology"
                        value={props.selectedOntologies}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={false}
                        isClearable
                        isMulti
                        autoFocus={false}
                        ols={false}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={props.toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={props.toggle}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
}

OntologiesModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    selectedOntologies: PropTypes.array.isRequired,
    setSelectedOntologies: PropTypes.func.isRequired
};

export default OntologiesModal;
