import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert } from 'reactstrap';
import { createLiteralStatement, createResourceStatement } from 'services/backend/statements';
import { createLiteral } from 'services/backend/literals';
import { createResource } from 'services/backend/resources';
import Tooltip from 'components/Utils/Tooltip';
import AuthorsInput from 'components/AuthorsInput/AuthorsInput';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { addVisualization } from 'services/similarity';
import { saveAuthors } from 'components/AuthorsInput/helpers';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

function PublishVisualization(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const displayName = useSelector(state => state.auth.user.displayName);

    const [visualizationCreators, setVisualizationCreators] = useState(
        props.authors ?? [{ label: displayName, id: displayName, orcid: '', statementId: '', __isNew__: true }],
    );

    const handleCreatorsChange = creators => {
        const _creators = creators || [];
        setVisualizationCreators(_creators);
    };

    const modelExists = () => {
        const currModel = new SelfVisDataModel();
        const reconstructionData = currModel.getReconstructionModel();
        return reconstructionData !== undefined;
    };

    const createReconstructionModel = resourceId => {
        const currModel = new SelfVisDataModel();
        // collect Data
        const metaVisData = {};
        metaVisData.orkgOrigin = resourceId;
        metaVisData.renderingEngine = currModel._renderingEngine;
        metaVisData.visMethod = currModel._renderingMethod;

        const reconstructionData = currModel.getReconstructionModel();
        metaVisData.googleChartsData = currModel.getGoogleChartsData();

        if (reconstructionData === undefined) {
            return undefined;
        }
        metaVisData.reconstructionData = reconstructionData;
        return metaVisData;
    };

    const createReconstructionModelInBackend = async (resourceId, model) => {
        try {
            await addVisualization({
                resourceId,
                jsonData: model,
            });
        } catch (error) {
            toast.error(`Error publishing a visualization : ${error.message}`);
        }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        if (!props.comparisonId) {
            //  ERROR
            setIsLoading(false);
            console.log('ERROR, No contribution id provided');
            return;
        }

        let backendReferenceResource = -1;
        if (modelExists()) {
            const execute = true;
            if (execute === true) {
                try {
                    if (description === '' || title === '') {
                        toast.error('Please enter a title and description');
                    } else {
                        const newResource = await createResource(title || '', [CLASSES.VISUALIZATION]);
                        // we need not to create a resource statement on the comparison;
                        backendReferenceResource = newResource.id;

                        await createResourceStatement(props.comparisonId, PREDICATES.HAS_VISUALIZATION, backendReferenceResource);
                        const predicateId = PREDICATES.DESCRIPTION;
                        const literalDescription = await createLiteral(description || '');
                        await createLiteralStatement(backendReferenceResource, predicateId, literalDescription.id);
                        await saveAuthors(visualizationCreators, backendReferenceResource);
                        const reconstructionModel = createReconstructionModel(backendReferenceResource);
                        await createReconstructionModelInBackend(backendReferenceResource, reconstructionModel);
                        setIsLoading(false);
                        // close this modal
                        props.closeAllAndReloadVisualizations();
                    }
                } catch (error) {
                    toast.error(`Error publishing a visualization : ${error.message}`);
                    setIsLoading(false);
                }
            }
        } else {
            toast.error('Error in publishing a visualization: Model is empty, select data ');
        }
        setIsLoading(false);
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish visualization</ModalHeader>
            <ModalBody>
                <Alert color="info">Your visualization will be added to the comparison</Alert>
                <>
                    {' '}
                    <FormGroup>
                        <Label for="title">
                            <Tooltip message="Enter the title of the visualization">Title</Tooltip>
                        </Label>
                        <Input type="text" name="title" value={title} id="title" onChange={e => setTitle(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="description">
                            <Tooltip message="Describe the goal and what is being visualized">Description</Tooltip>
                        </Label>
                        <Input
                            type="textarea"
                            style={{ minHeight: '20px !important' }}
                            name="description"
                            value={description}
                            id="description"
                            onChange={e => setDescription(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Creator">
                            <Tooltip message="The creator(s) of the visualization. Enter both the first and last name">
                                Creators <span className="text-muted fst-italic">(optional)</span>
                            </Tooltip>
                        </Label>
                        <AuthorsInput itemLabel="creator" handler={handleCreatorsChange} value={visualizationCreators} />
                    </FormGroup>
                </>

                <></>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    {/* <Button color="primary" disabled={isLoading} onClick={handleSubmit}> */}
                    <Button color="primary" onClick={handleSubmit}>
                        {isLoading && <span className="fa fa-spinner fa-spin" />} Publish
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
}

PublishVisualization.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    closeAllAndReloadVisualizations: PropTypes.func.isRequired,
    comparisonId: PropTypes.string,
    // doi: PropTypes.string,
    authors: PropTypes.array, // not necessary required
};

export default PublishVisualization;
