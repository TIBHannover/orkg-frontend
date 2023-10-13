import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { generateGraphMLFile, generateJSONFile } from 'components/DiagramEditor/helpers';

function ExportDiagram({ isExportDiagramModalOpen, setIsExportDiagramModalOpen, diagram, diagramResource }) {
    return (
        <Modal isOpen={isExportDiagramModalOpen} toggle={setIsExportDiagramModalOpen}>
            <ModalHeader toggle={setIsExportDiagramModalOpen}>Export diagram</ModalHeader>
            <ModalBody>
                <Alert color="info">This is a prototype version to export ORKG diagrams to GraphML, not all diagram data is included.</Alert>
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={() => generateGraphMLFile(diagram, diagramResource)}>
                    <Icon icon={faDownload} /> GraphML
                </Button>
                <Button color="secondary-darker" onClick={() => generateJSONFile(diagram, diagramResource)}>
                    <Icon icon={faDownload} /> JSON
                </Button>
                <Button color="secondary" onClick={setIsExportDiagramModalOpen}>
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
}

ExportDiagram.propTypes = {
    isExportDiagramModalOpen: PropTypes.bool.isRequired,
    setIsExportDiagramModalOpen: PropTypes.func.isRequired,
    diagram: PropTypes.object,
    diagramResource: PropTypes.object,
};
export default ExportDiagram;
