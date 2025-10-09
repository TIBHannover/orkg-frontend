import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { useCopyToClipboard } from 'react-use';

import { OptionType } from '@/components/Autocomplete/types';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import AuthorsInput from '@/components/Input/AuthorsInput/AuthorsInput';
import ResearchFieldInput from '@/components/Input/ResearchFieldInput/ResearchFieldInput';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import useParams from '@/components/useParams/useParams';
import Tooltip from '@/components/Utils/Tooltip';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { publishPaper } from '@/services/backend/papers';
import { getStatements } from '@/services/backend/statements';
import { Author } from '@/services/backend/types';

type PublishProps = {
    showDialog: boolean;
    toggle: () => void;
};

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
            toast.dismiss();
            toast.success('DOI link copied!');
        }
    }, [state.value]);

    const isPublishable = title && title.trim() !== '' && description && description.trim() !== '' && researchField && creators?.length > 0;

    useEffect(() => {
        setResearchField(viewPaper?.research_fields && viewPaper?.research_fields?.length > 0 ? viewPaper?.research_fields?.[0] : null);
        setCreators(viewPaper?.authors || []);
    }, [viewPaper]);

    if (!viewPaper) {
        return null;
    }

    const publishDOI = async (paperId: string) => {
        if (isPublishable) {
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
            toast.error('Title or a description is missing.');
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            publishDOI(viewPaper.id);
        } catch (error: unknown) {
            toast.error('Error publishing a paper');
            setIsLoading(false);
        }
    };

    return (
        <Modal size="lg" isOpen={showDialog} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish ORKG paper</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    {viewPaper.id && !dataCiteDoi && (
                        <>Persistently identified papers will be findable in global scholarly infrastructures (DataCite, OpenAIRE and ORCID).</>
                    )}
                    {createdPaperId && dataCiteDoi && (
                        <>
                            DOI is assigned successfully.{' '}
                            <Link target="_blank" href={reverse(ROUTES.VIEW_PAPER, { resourceId: createdPaperId })}>
                                View published version
                            </Link>
                        </>
                    )}
                </Alert>
                {createdPaperId && dataCiteDoi && (
                    <FormGroup>
                        <Label for="doi_link">DOI</Label>
                        <InputGroup>
                            <Input id="doi_link" value={`https://doi.org/${dataCiteDoi}`} disabled />
                            <Button
                                color="primary"
                                className="pl-3 pr-3"
                                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                onClick={() => copyToClipboard(`https://doi.org/${dataCiteDoi}`)}
                            >
                                <FontAwesomeIcon icon={faClipboard} />
                            </Button>
                        </InputGroup>
                    </FormGroup>
                )}
                {!dataCiteDoi && (
                    <>
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Title of the paper">Title</Tooltip>
                            </Label>
                            <Input type="text" maxLength={MAX_LENGTH_INPUT} name="title" value={`${title} [ORKG]`} disabled id="title" />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">
                                <Tooltip message="Description of the paper">Description</Tooltip>
                            </Label>
                            <Input
                                type="textarea"
                                name="description"
                                value={description}
                                id="description"
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={MAX_LENGTH_INPUT}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="research-field">
                                <Tooltip message="Enter a subject of the paper">Research Field</Tooltip>
                            </Label>
                            <ResearchFieldInput value={researchField} onChange={setResearchField} inputId="researchField" title={title} />
                        </FormGroup>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="The creator or creators of ORKG paper.">Creators</Tooltip>
                            </Label>
                            <AuthorsInput itemLabel="creator" handler={(_creators) => setCreators(_creators || [])} value={creators} />
                        </FormGroup>
                    </>
                )}
            </ModalBody>
            {!dataCiteDoi && (
                <ModalFooter>
                    {!dataCiteDoi && (
                        <div className="text-align-center mt-2">
                            <ButtonWithLoading color="primary" isLoading={isLoading} onClick={handleSubmit} disabled={!isPublishable}>
                                Publish
                            </ButtonWithLoading>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
};

export default Publish;
