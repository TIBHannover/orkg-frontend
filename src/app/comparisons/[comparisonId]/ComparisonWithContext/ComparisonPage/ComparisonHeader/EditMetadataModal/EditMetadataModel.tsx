import { Button, Checkbox, Input, Label, Modal, TextArea, TextField } from '@heroui/react';
import dayjs from 'dayjs';
import { FC, useEffect, useId, useState } from 'react';
import Select from 'react-select';

import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import useComparison from '@/components/Comparison/hooks/useComparison';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import Tooltip from '@/components/Utils/Tooltip';
import { CONFERENCE_REVIEW_MISC } from '@/constants/organizationsTypes';
import { getConferencesSeries } from '@/services/backend/conferences-series';
import { Author, ConferenceSeries, Node } from '@/services/backend/types';

const EditMetadataModal: FC<{ toggle: () => void; comparisonId: string }> = ({ toggle, comparisonId }) => {
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    const isConferenceDoubleBlind =
        selectedConference?.metadata.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND &&
        dayjs().format('YYYY-MM-DD') < selectedConference?.metadata?.start_date;

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog className="max-w-3xl">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Edit metadata</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        <form className="flex flex-col gap-6 px-2 py-2" onSubmit={(e) => e.preventDefault()}>
                            <TextField fullWidth>
                                <Label htmlFor={`${formId}-title`}>
                                    <Tooltip message="The title of the comparison">Title</Tooltip>
                                </Label>
                                <Input id={`${formId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} />
                            </TextField>

                            <TextField fullWidth>
                                <Label htmlFor={`${formId}-description`}>
                                    <Tooltip message="The description of the comparison">Description</Tooltip>
                                </Label>
                                <TextArea
                                    id={`${formId}-description`}
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </TextField>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`${formId}-researchField`}>
                                    <Tooltip message="Provide the main research field of this comparison">Research field</Tooltip>
                                </Label>
                                <ResearchFieldInput value={researchField} onChange={setResearchField} inputId={`${formId}-researchField`} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`${formId}-authors`}>
                                    <Tooltip message="The author or authors of the comparison. Enter both the first and last name">Authors</Tooltip>
                                </Label>
                                <AuthorsInput value={authors} handler={setAuthors} buttonId={`${formId}-authors`} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor={`${formId}-conference`}>
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
                                    classNames={customClassNames as any}
                                    styles={customStyles as any}
                                    menuPosition="fixed"
                                />
                            </div>

                            <Checkbox
                                isSelected={isConferenceDoubleBlind || isAnonymized}
                                isDisabled={isConferenceDoubleBlind}
                                onChange={(checked) => setIsAnonymized(checked)}
                            >
                                <Checkbox.Control>
                                    <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>
                                    <Tooltip message="Hide the authors and the creator to make the comparison suitable for a anonymous conference submission">
                                        Is anonymized
                                    </Tooltip>
                                    {isConferenceDoubleBlind && (
                                        <span className="ml-1 text-sm text-muted">
                                            (until the conference date: {dayjs(selectedConference?.metadata?.start_date).format('DD MMM YYYY')})
                                        </span>
                                    )}
                                </Checkbox.Content>
                            </Checkbox>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onPress={handleSave}>Save</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default EditMetadataModal;
