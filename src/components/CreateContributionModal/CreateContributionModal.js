import { faExternalLinkAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useCreateContribution from 'components/CreateContributionModal/hooks/useCreateContribution';
import Tooltip from 'components/Utils/Tooltip';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

// TODO: accepted paper data as props:
// it is not really needed to fetch the contribution data, it could be passed as props as well
const CreateContributionModal = ({ isOpen, toggle, paperId, onCreateContribution }) => {
    const [title, setTitle] = useState('');
    const { isLoading, isLoadingPaper, createContribution, paperTitle, contributionCount } = useCreateContribution({ paperId, isOpen });

    // set the default contribution label (which is the current count plus 1)
    useEffect(() => {
        setTitle(`Contribution ${contributionCount + 1}`);
    }, [contributionCount]);

    const handleCreate = async () => {
        const contributionId = await createContribution(title);
        onCreateContribution(contributionId);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Create new contribution</ModalHeader>
            <ModalBody>
                {!isLoadingPaper ? (
                    <FormGroup>
                        {paperTitle && (
                            <Alert color="info" fade={false}>
                                You are about to add a contribution to the paper{' '}
                                <Link target="_blank" to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>
                                    {paperTitle} <Icon icon={faExternalLinkAlt} />
                                </Link>
                            </Alert>
                        )}
                        <Label for="title">
                            <Tooltip message="Enter the title of the contribution">Contribution title</Tooltip>
                        </Label>
                        <InputGroup>
                            <Input value={title} type="text" id="title" onChange={e => setTitle(e.target.value)} />
                        </InputGroup>
                    </FormGroup>
                ) : (
                    <div className="text-center mt-3 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button disabled={title.length === 0 || isLoading} color="primary" className="float-right" onClick={handleCreate}>
                    {!isLoading ? 'Create' : 'Loading...'}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

CreateContributionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperId: PropTypes.string.isRequired,
    onCreateContribution: PropTypes.func.isRequired
};

export default CreateContributionModal;
