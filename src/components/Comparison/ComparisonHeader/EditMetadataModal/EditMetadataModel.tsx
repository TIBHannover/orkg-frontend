import dayjs from 'dayjs';
import { FC, useEffect, useId, useState } from 'react';
import Select from 'react-select';
import { Button, Form, FormGroup, Input, Label, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import useComparison from '@/components/Comparison/hooks/useComparison';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import Tooltip from '@/components/Utils/Tooltip';
import { CONFERENCE_REVIEW_MISC } from '@/constants/organizationsTypes';
import { getConferencesSeries } from '@/services/backend/conferences-series';
import { Author, ConferenceSeries, Node } from '@/services/backend/types';

const EditMetadataModal: FC<{ toggle: () => void; comparisonId: string }> = ({ toggle, comparisonId }) => {
    const isLoadingEdit = false;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [conferences, setConferences] = useState<ConferenceSeries[]>([]);
    const [selectedConference, setSelectedConference] = useState<ConferenceSeries | null>(null);
    const [isAnonymized, setIsAnonymized] = useState(false);

    const [researchField, setResearchField] = useState<Node | null>(null);
    const [authors, setAuthors] = useState<Author[]>([]);
    const { comparison, updateComparison } = useComparison(comparisonId);
    const formId = useId();

    useEffect(() => {
        if (comparison) {
            setTitle(comparison.title);
            setDescription(comparison.description);
            setResearchField(comparison.research_fields[0]);
            setAuthors(comparison.authors);
            setIsAnonymized(comparison.is_anonymized);
            const conference = conferences.find(({ id }) => comparison?.organizations.includes(id));
            if (conference) {
                setSelectedConference(conference);
            }
        }
    }, [comparison, conferences, setSelectedConference]);

    useEffect(() => {
        const loadConferences = async () => {
            setConferences((await getConferencesSeries()).content);
        };
        loadConferences();
    }, []);

    const handleSave = () => {
        updateComparison({
            title,
            ...(researchField ? { research_fields: [researchField] } : {}),
            authors,
            description,
            is_anonymized: isAnonymized,
            organizations: selectedConference?.id ? [selectedConference.id] : [],
        });
        toggle();
    };

    const isConferenceDoubleBlind =
        selectedConference?.metadata.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND &&
        dayjs().format('YYYY-MM-DD') < selectedConference?.metadata?.start_date;

    return (
        <ModalWithLoading isLoading={isLoadingEdit} isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle} cssModule={{ 'modal-title': 'modal-title w-100 d-flex justify-content-between' }}>
                <span>Edit metadata</span>
            </ModalHeader>
            <ModalBody>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <FormGroup>
                        <Label for={`${formId}-title`}>
                            <Tooltip message="The title of the comparison">Title</Tooltip>
                        </Label>
                        <Input id={`${formId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-description`}>
                            <Tooltip message="The description of the comparison">Description</Tooltip>
                        </Label>
                        <Input
                            type="textarea"
                            rows="3"
                            id={`${formId}-description`}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-researchField`}>
                            <Tooltip message="Provide the main research field of this comparison">Research field</Tooltip>
                        </Label>
                        <ResearchFieldInput value={researchField} onChange={setResearchField} inputId={`${formId}-researchField`} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-authors`}>
                            <Tooltip message="The author or authors of the comparison. Enter both the first and last name">Authors</Tooltip>
                        </Label>
                        <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-conference`}>
                            <Tooltip message="Select the conference if this comparison belongs to the submission of a conference. Only selected conferences are supported.">
                                Conference
                            </Tooltip>
                        </Label>
                        <Select
                            value={selectedConference}
                            options={conferences}
                            onChange={setSelectedConference}
                            getOptionValue={({ id }) => id}
                            getOptionLabel={({ name }) => name}
                            inputId={`${formId}-conference`}
                            isClearable
                            classNamePrefix="react-select"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label for={`${formId}-is-anonymized`}>
                            <Tooltip message="Hide the authors and the creator to make the comparison suitable for a anonymous conference submission">
                                Anonymized
                            </Tooltip>
                        </Label>
                        <br />
                        <Input
                            type="checkbox"
                            id={`${formId}-is-anonymized`}
                            onChange={(e) => setIsAnonymized(e.target.checked)}
                            checked={isConferenceDoubleBlind || isAnonymized}
                            disabled={isConferenceDoubleBlind}
                        />{' '}
                        <Label check for={`${formId}-is-anonymized`} className="mb-0">
                            Is anonymized{' '}
                            {isConferenceDoubleBlind && (
                                <>(until the conference date: {dayjs(selectedConference?.metadata?.start_date).format('DD MMM YYYY')})</>
                            )}
                        </Label>
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter className="align-items-center">
                <Button color="primary" onClick={handleSave}>
                    Save
                </Button>
            </ModalFooter>
        </ModalWithLoading>
    );
};

export default EditMetadataModal;
