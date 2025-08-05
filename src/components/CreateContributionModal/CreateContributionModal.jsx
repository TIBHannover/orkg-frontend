import { faExternalLinkAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useCreateContribution from '@/components/CreateContributionModal/hooks/useCreateContribution';
import Alert from '@/components/Ui/Alert/Alert';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Tooltip from '@/components/Utils/Tooltip';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';

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
                                <Link target="_blank" href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>
                                    {paperTitle} <FontAwesomeIcon icon={faExternalLinkAlt} />
                                </Link>
                            </Alert>
                        )}
                        <Label for="title">
                            <Tooltip message="Enter the title of the contribution">Contribution title</Tooltip>
                        </Label>
                        <InputGroup>
                            <Input value={title} maxLength={MAX_LENGTH_INPUT} type="text" id="title" onChange={(e) => setTitle(e.target.value)} />
                        </InputGroup>
                    </FormGroup>
                ) : (
                    <div className="text-center mt-3 mb-4">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </ModalBody>
            <ModalFooter className="d-flex">
                <ButtonWithLoading
                    disabled={title.length === 0 || isLoading}
                    color="primary"
                    className="float-end"
                    onClick={handleCreate}
                    isLoading={isLoading}
                >
                    Create
                </ButtonWithLoading>
            </ModalFooter>
        </Modal>
    );
};

CreateContributionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperId: PropTypes.string.isRequired,
    onCreateContribution: PropTypes.func.isRequired,
};

export default CreateContributionModal;
