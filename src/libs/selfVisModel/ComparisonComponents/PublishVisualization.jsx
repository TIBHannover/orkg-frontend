import PropTypes from 'prop-types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Alert } from 'reactstrap';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useMembership from '@/components/hooks/useMembership';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Tooltip from '@/components/Utils/Tooltip';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import THING_TYPES from '@/constants/thingTypes';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import { createResourceStatement } from '@/services/backend/statements';
import { createVisualization } from '@/services/backend/visualizations';
import { createThing } from '@/services/simcomp';

function PublishVisualization({ showDialog, toggle, closeAllAndReloadVisualizations, comparisonId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const { mutate } = useComparison();
    const [description, setDescription] = useState('');
    const { displayName, organizationId, observatoryId } = useMembership();

    const [authors, setAuthors] = useState([
        {
            name: displayName,
            identifiers: {
                orcid: [],
            },
        },
    ]);

    const modelExists = () => {
        const currModel = new SelfVisDataModel();
        const reconstructionData = currModel.getReconstructionModel();
        return reconstructionData !== undefined;
    };

    const createReconstructionModel = (resourceId) => {
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
            await createThing({ thingType: THING_TYPES.VISUALIZATION, thingKey: resourceId, data: model });
        } catch (error) {
            toast.error(`Error publishing a visualization : ${error.message}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (!comparisonId) {
            //  ERROR
            setIsLoading(false);
            console.error('ERROR, No contribution id provided');
            return;
        }

        if (modelExists()) {
            const execute = true;
            if (execute === true) {
                try {
                    if (description === '' || title === '') {
                        toast.error('Please enter a title and description');
                    } else {
                        const backendReferenceResource = await createVisualization({
                            title,
                            description,
                            authors,
                            observatories: observatoryId ? [observatoryId] : [],
                            organizations: organizationId ? [organizationId] : [],
                        });

                        // we need to create a resource statement on the comparison;
                        await createResourceStatement(comparisonId, PREDICATES.HAS_VISUALIZATION, backendReferenceResource);
                        const reconstructionModel = createReconstructionModel(backendReferenceResource);
                        await createReconstructionModelInBackend(backendReferenceResource, reconstructionModel);
                        setIsLoading(false);
                        mutate();
                        // close this modal
                        closeAllAndReloadVisualizations();
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
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish visualization</ModalHeader>
            <ModalBody>
                <Alert color="info">Your visualization will be added to the comparison</Alert>
                <>
                    {' '}
                    <FormGroup>
                        <Label for="title">
                            <Tooltip message="Enter the title of the visualization">Title</Tooltip>
                        </Label>
                        <Input
                            type="text"
                            maxLength={MAX_LENGTH_INPUT}
                            name="title"
                            value={title}
                            id="title"
                            onChange={(e) => setTitle(e.target.value)}
                        />
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
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for="Creator">
                            <Tooltip message="The creator(s) of the visualization. Enter both the first and last name">
                                Creators <span className="text-muted fst-italic">(optional)</span>
                            </Tooltip>
                        </Label>
                        <AuthorsInput itemLabel="creator" handler={setAuthors} value={authors} />
                    </FormGroup>
                </>
            </ModalBody>
            <ModalFooter>
                <div className="text-align-center mt-2">
                    <ButtonWithLoading isLoading={isLoading} color="primary" onClick={handleSubmit}>
                        Publish
                    </ButtonWithLoading>
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
};

export default PublishVisualization;
