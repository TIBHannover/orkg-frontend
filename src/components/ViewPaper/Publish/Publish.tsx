import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal, toast, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { useCopyToClipboard } from 'react-use';

import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { publishPaper } from '@/services/backend/papers';
import { getStatements } from '@/services/backend/statements';
import { Author } from '@/services/backend/types';

type PublishProps = {
    showDialog: boolean;
    toggle: () => void;
};

const FieldLabel = ({ htmlFor, children, hint }: { htmlFor: string; children: string; hint: string }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium inline-flex items-center gap-1">
        {children}
        <Tooltip delay={0}>
            <Tooltip.Trigger>
                <FontAwesomeIcon icon={faQuestionCircle} className="text-muted cursor-help" />
            </Tooltip.Trigger>
            <Tooltip.Content showArrow>
                <Tooltip.Arrow />
                {hint}
            </Tooltip.Content>
        </Tooltip>
    </label>
);

const inputClass =
    'w-full px-3 py-2 rounded-md border border-border bg-field-background text-field-foreground focus:outline-none focus:ring-2 focus:ring-focus/40 disabled:opacity-60 disabled:cursor-not-allowed';

const Publish = ({ showDialog, toggle }: PublishProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [researchField, setResearchField] = useState<SingleValue<OptionType>>(null);
    const [creators, setCreators] = useState<Author[]>([]);
    const { resourceId } = useParams();
    const { paper: viewPaper } = useViewPaper({ paperId: resourceId });
    const [dataCiteDoi, setDataCiteDoi] = useState('');
    const [createdPaperId, setCreatedPaperId] = useState('');
    const { title } = viewPaper || {};
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if (state.value) {
            toast.clear();
            toast.success('DOI link copied!');
        }
    }, [state.value]);

    const isPublishable = !!(title && title.trim() !== '' && description && description.trim() !== '' && researchField && creators?.length > 0);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResearchField(viewPaper?.research_fields && viewPaper?.research_fields?.length > 0 ? viewPaper?.research_fields?.[0] : null);
        setCreators(viewPaper?.authors || []);
    }, [viewPaper]);

    if (!viewPaper) {
        return null;
    }

    const publishDOI = async (paperId: string) => {
        if (isPublishable && researchField) {
            const publishedPaperId = await publishPaper(paperId, {
                subject: researchField.label,
                description,
                authors: creators,
            });
            const statements = await getStatements({ subjectId: publishedPaperId, predicateId: PREDICATES.HAS_DOI });
            setCreatedPaperId(publishedPaperId);
            setDataCiteDoi(statements[0].object.label);
            setIsLoading(false);
            toast.success('DOI has been registered successfully');
        } else {
            toast.danger('Title or a description is missing.');
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            publishDOI(viewPaper.id);
        } catch {
            toast.danger('Error publishing a paper');
            setIsLoading(false);
        }
    };

    const isPublished = !!(createdPaperId && dataCiteDoi);

    return (
        <Modal.Backdrop
            isOpen={showDialog}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
            isDismissable={!isLoading}
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog className="max-w-2xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Publish ORKG paper</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col gap-4">
                            {isPublished ? (
                                <Alert status="success">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>DOI assigned</Alert.Title>
                                        <Alert.Description>
                                            DOI is assigned successfully.{' '}
                                            <Link target="_blank" href={reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaperId })}>
                                                View published version
                                            </Link>
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                            ) : (
                                <Alert status="accent">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Title>Make this paper findable</Alert.Title>
                                        <Alert.Description>
                                            Persistently identified papers will be findable in global scholarly infrastructures (DataCite, OpenAIRE
                                            and ORCID).
                                        </Alert.Description>
                                    </Alert.Content>
                                </Alert>
                            )}

                            {isPublished && (
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="doi_link" className="text-sm font-medium">
                                        DOI
                                    </label>
                                    <div className="flex h-10 items-stretch">
                                        <input
                                            id="doi_link"
                                            aria-label="DOI link"
                                            value={`https://doi.org/${dataCiteDoi}`}
                                            disabled
                                            className={`${inputClass} !h-10 !rounded-e-none flex-1 min-w-0 font-mono text-sm`}
                                            readOnly
                                        />
                                        <Button
                                            variant="primary"
                                            aria-label="Copy DOI link"
                                            className="!h-10 !rounded-s-none -ms-px px-4"
                                            onPress={() => copyToClipboard(`https://doi.org/${dataCiteDoi}`)}
                                        >
                                            <FontAwesomeIcon icon={faClipboard} />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!isPublished && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <FieldLabel htmlFor="title" hint="Title of the paper">
                                            Title
                                        </FieldLabel>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            aria-label="Title"
                                            value={`${title} [ORKG]`}
                                            disabled
                                            maxLength={MAX_LENGTH_INPUT}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <FieldLabel htmlFor="description" hint="Description of the paper">
                                            Description
                                        </FieldLabel>
                                        <textarea
                                            id="description"
                                            name="description"
                                            aria-label="Description"
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            maxLength={MAX_LENGTH_INPUT}
                                            className={inputClass}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <FieldLabel htmlFor="researchField" hint="Enter a subject of the paper">
                                            Research field
                                        </FieldLabel>
                                        <ResearchFieldInput value={researchField} onChange={setResearchField} inputId="researchField" title={title} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <FieldLabel htmlFor="Creator" hint="The creator or creators of the ORKG paper">
                                            Creators
                                        </FieldLabel>
                                        <AuthorsInput itemLabel="creator" handler={(_creators) => setCreators(_creators || [])} value={creators} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Modal.Body>
                    {!isPublished && (
                        <Modal.Footer>
                            <Button variant="ghost" onPress={toggle} isDisabled={isLoading}>
                                Cancel
                            </Button>
                            <ButtonWithLoading
                                variant="primary"
                                isLoading={isLoading}
                                onClick={(e) => handleSubmit(e as unknown as MouseEvent<HTMLElement>)}
                                isDisabled={!isPublishable}
                            >
                                Publish
                            </ButtonWithLoading>
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default Publish;
