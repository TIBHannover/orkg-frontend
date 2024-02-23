import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { getComparisonConfigObject } from 'components/Comparison/hooks/helpers';
import Link from 'components/NextJsMigration/Link';
import { CLASSES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import THING_TYPES from 'constants/thingTypes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { createResource } from 'services/backend/resources';
import { createThing } from 'services/similarity';

const SaveDraft = ({ isOpen, toggle }) => {
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [savedDraftId, setSavedDraftId] = useState(null);
    const comparisonConfigObject = useSelector(state => getComparisonConfigObject(state.comparison));

    const saveDraft = async () => {
        if (!title || !title.trim()) {
            toast.error('Enter a comparison title');
            return;
        }

        setIsLoading(true);
        const draftComparison = await createResource(title, [CLASSES.COMPARISON_DRAFT]);
        await createThing({
            thingType: THING_TYPES.DRAFT_COMPARISON,
            thingKey: draftComparison.id,
            config: comparisonConfigObject,
        });
        setSavedDraftId(draftComparison.id);
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <Form onSubmit={e => e.preventDefault()}>
                <ModalHeader toggle={toggle}>Save as draft</ModalHeader>
                <ModalBody>
                    {!savedDraftId ? (
                        <>
                            <Alert color="info">
                                You can access draft comparisons from your account page. Different from published comparisons, it is possible to
                                change or remove draft comparisons later
                            </Alert>
                            <FormGroup>
                                <Label for="draft-title">Title</Label>
                                <Input
                                    type="text"
                                    maxLength={MAX_LENGTH_INPUT}
                                    id="draft-title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </FormGroup>
                        </>
                    ) : (
                        <Alert color="success">
                            Draft comparison saved successfully.{' '}
                            <Link href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-comparisons' })}>View draft comparisons</Link>
                        </Alert>
                    )}
                </ModalBody>
                {!savedDraftId && (
                    <ModalFooter>
                        <ButtonWithLoading type="submit" color="primary" isLoading={isLoading} onClick={saveDraft}>
                            Save
                        </ButtonWithLoading>
                    </ModalFooter>
                )}
            </Form>
        </Modal>
    );
};

SaveDraft.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default SaveDraft;
