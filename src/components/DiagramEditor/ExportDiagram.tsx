import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal } from '@heroui/react';
import { FC } from 'react';

import { generateGraphMLFile, generateJSONFile } from '@/components/DiagramEditor/helpers';
import { Resource } from '@/services/backend/types';

type ExportDiagramProps = {
    isExportDiagramModalOpen: boolean;
    setIsExportDiagramModalOpen: () => void;
    diagram: Resource;
    diagramResource: Resource;
};

const ExportDiagram: FC<ExportDiagramProps> = ({ isExportDiagramModalOpen, setIsExportDiagramModalOpen, diagram, diagramResource }) => (
    <Modal.Backdrop
        isOpen={isExportDiagramModalOpen}
        onOpenChange={(open) => {
            if (!open) setIsExportDiagramModalOpen();
        }}
    >
        <Modal.Container size="md">
            <Modal.Dialog className="sm:max-w-lg">
                <Modal.CloseTrigger />
                <Modal.Header>
                    <Modal.Heading>Export diagram</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                    <Alert status="accent">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>
                                This is a prototype version to export ORKG diagrams to GraphML, not all diagram data is included.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onPress={() => generateGraphMLFile(diagram, diagramResource)}>
                        <FontAwesomeIcon icon={faDownload} /> GraphML
                    </Button>
                    <Button variant="secondary" onPress={() => generateJSONFile(diagram, diagramResource)}>
                        <FontAwesomeIcon icon={faDownload} /> JSON
                    </Button>
                    <Button variant="secondary" onPress={setIsExportDiagramModalOpen}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default ExportDiagram;
