import { Cite } from '@citation-js/core';
import { faCheck, faCheckCircle, faPen, faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqueId } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import ActionButton from '@/components/ActionButton/ActionButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useMembership from '@/components/hooks/useMembership';
import { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import Table from '@/components/Ui/Table/Table';
import { CLASSES, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { Author, CreateContributionData, NewContribution } from '@/services/backend/types';
import { deleteAnnotation, updateAnnotationIsExtractionModalOpen } from '@/slices/pdfAnnotationSlice';
import { RootStore } from '@/slices/types';
import { parseCiteResult } from '@/utils';

type SaveProps = {
    toggle: () => void;
    isOpen: boolean;
};

const Save: FC<SaveProps> = ({ toggle, isOpen }) => {
    const { organizationId, observatoryId } = useMembership();
    const dispatch = useDispatch();
    const annotations = useSelector((state: RootStore) => state.pdfAnnotation.annotations);
    const [title, setTitle] = useState('');
    const [doi, setDoi] = useState('');
    const [paperId, setPaperId] = useState<string | null>(null);
    const [saveBy, setSaveBy] = useState('doi');
    const [doiIsFetching, setDoiIsFetching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [paperData, setPaperData] = useState<{
        paperTitle: string | null;
        paperAuthors: Author[];
        paperPublicationMonth: number | null;
        paperPublicationYear: number | null;
        doi: string | null;
        publishedIn: string | null;
    }>({
        paperTitle: null,
        paperAuthors: [],
        paperPublicationMonth: null,
        paperPublicationYear: null,
        doi: null,
        publishedIn: null,
    });

    const handleSave = async () => {
        const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi: _doi, publishedIn } = paperData;
        const _title = saveBy === 'doi' ? paperTitle : title;

        if (!_title) {
            if (saveBy === 'doi') {
                toast.error("The DOI data is not fetched. Enter a valid DOI and click 'Lookup'");
            } else {
                toast.error('Please enter a paper title');
            }
            return;
        }
        setIsLoading(true);

        const contribution: NewContribution = {
            label: 'Annotation contribution',
            statements: {},
        };
        const createContributionData: CreateContributionData = {
            resources: {},
            literals: {},
        };

        for (const annotation of annotations.filter((a) => a.type !== SURVEY_TABLES_IRI && a.type !== CSVW_TABLE_IRI)) {
            const resourceId: string = uniqueId('#');
            createContributionData.resources![resourceId] = {
                label: annotation.type,
                classes: [annotation.type, CLASSES.SENTENCE],
            };
            const literalId: string = uniqueId('#');
            createContributionData.literals![literalId] = {
                label: annotation.content?.text ?? '',
            };
            if (!(PREDICATES.CONTAINS in contribution.statements)) {
                contribution.statements[PREDICATES.CONTAINS] = [];
            }
            contribution.statements[PREDICATES.CONTAINS].push({
                id: resourceId,
                statements: {
                    [PREDICATES.HAS_CONTENT]: [
                        {
                            id: literalId,
                        },
                    ],
                },
            });
        }

        const _paperId = await createPaperMergeIfExists({
            paper: {
                title: _title,
                research_fields: [RESOURCES.RESEARCH_FIELD_MAIN],
                ...(_doi
                    ? {
                          identifiers: {
                              doi: [_doi],
                          },
                      }
                    : {}),
                publication_info: {
                    published_month: paperPublicationMonth,
                    published_year: paperPublicationYear,
                    published_in: publishedIn || null,
                    // url,
                },
                authors: paperAuthors,
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
            },
            contribution,
            createContributionData,
        });

        setIsLoading(false);
        setPaperId(_paperId);
    };

    const fetchDoi = async () => {
        if (!doi) {
            toast.error('Please enter a DOI');
            return;
        }

        setDoiIsFetching(true);

        await Cite.async(doi)
            .catch((e: Error) => {
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        toast.error('This format is not supported or recognized');
                        break;
                    case 'Server responded with status code 404':
                        toast.error('No paper has been found');

                        break;
                    default:
                        toast.error('An error occurred, reload the page and try again');
                        break;
                }
                setDoiIsFetching(false);
                return null;
            })
            // @ts-expect-error
            .then((paper) => {
                if (paper) {
                    const parseResult = parseCiteResult(paper);
                    const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi: _doi, publishedIn } = parseResult;

                    setPaperData({
                        paperTitle,
                        paperAuthors,
                        paperPublicationMonth: parseInt(paperPublicationMonth, 10) || null,
                        paperPublicationYear: parseInt(paperPublicationYear, 10) || null,
                        doi: _doi,
                        publishedIn,
                    });
                    setDoiIsFetching(false);
                }
            });
    };

    const handleClose = () => {
        toggle();
        setPaperId(null);
    };

    return (
        <Modal isOpen={isOpen} toggle={handleClose}>
            <ModalHeader toggle={handleClose}>Save annotations</ModalHeader>
            <ModalBody>
                {!paperId &&
                    annotations.filter((annotation) => annotation.type !== SURVEY_TABLES_IRI && annotation.type !== CSVW_TABLE_IRI).length > 0 && (
                        <>
                            <Label for="exampleUrl">Add paper by</Label>
                            <br />
                            <ButtonGroup size="sm">
                                <Button color={saveBy === 'doi' ? 'primary' : 'light'} onClick={() => setSaveBy('doi')}>
                                    Paper DOI
                                </Button>
                                <Button color={saveBy === 'title' ? 'primary' : 'light'} onClick={() => setSaveBy('title')}>
                                    Paper title
                                </Button>
                            </ButtonGroup>
                            <hr />
                            {saveBy === 'doi' && (
                                <>
                                    <FormGroup>
                                        <Label for="exampleUrl">Paper DOI</Label>
                                        <InputGroup id="doiInputGroup">
                                            <Input type="url" name="url" value={doi} onChange={(e) => setDoi(e.target.value)} />

                                            <Button
                                                outline
                                                color="primary"
                                                style={{ minWidth: 130 }}
                                                onClick={fetchDoi}
                                                disabled={doiIsFetching}
                                                data-test="lookupDoi"
                                            >
                                                {!doiIsFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                            </Button>
                                        </InputGroup>
                                    </FormGroup>
                                    {paperData.paperTitle && (
                                        <p>
                                            <strong>Paper title:</strong> {paperData.paperTitle}
                                        </p>
                                    )}
                                </>
                            )}
                            {saveBy === 'title' && (
                                <FormGroup>
                                    <Label for="exampleUrl">Paper title</Label>
                                    <Input type="url" name="url" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </FormGroup>
                            )}
                        </>
                    )}
                {!paperId &&
                    annotations.filter((annotation) => annotation.type !== SURVEY_TABLES_IRI && annotation.type !== CSVW_TABLE_IRI).length === 0 && (
                        <Alert color="danger">You didn't make any text annotations yet, so there is nothing to save</Alert>
                    )}
                {annotations.filter((annotation) => annotation.type === SURVEY_TABLES_IRI || annotation.type === CSVW_TABLE_IRI).length > 0 && (
                    <div>
                        <p>You have made the following table annotations:</p>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Table</th>
                                    <th>Page</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {annotations
                                    .filter((annotation) => annotation.type === SURVEY_TABLES_IRI || annotation.type === CSVW_TABLE_IRI)
                                    .map((annotation, index) => (
                                        <tr key={`row${annotation?.id}`}>
                                            <th scope="row">Table {index + 1}</th>
                                            <td>{annotation.position.pageNumber}</td>
                                            <td>
                                                {annotation.view !== 'done' && 'Editing'}
                                                {annotation.view === 'done' && 'Done'}
                                            </td>
                                            <td>
                                                {annotation.view !== 'done' && (
                                                    <>
                                                        <ActionButton
                                                            title="Edit annotation table"
                                                            icon={faPen}
                                                            action={() =>
                                                                dispatch(
                                                                    updateAnnotationIsExtractionModalOpen({
                                                                        id: annotation.id,
                                                                        isExtractionModalOpen: true,
                                                                    }),
                                                                )
                                                            }
                                                        />

                                                        <ActionButton
                                                            title="Remove annotation"
                                                            icon={faTrash}
                                                            requireConfirmation
                                                            confirmationMessage="Are you sure?"
                                                            confirmationButtons={[
                                                                {
                                                                    title: 'Delete',
                                                                    color: 'danger',
                                                                    icon: faCheck,
                                                                    action: async () => {
                                                                        await dispatch(deleteAnnotation(annotation.id));
                                                                    },
                                                                },
                                                                {
                                                                    title: 'Cancel',
                                                                    color: 'secondary',
                                                                    icon: faTimes,
                                                                },
                                                            ]}
                                                        />
                                                    </>
                                                )}
                                                {annotation.view === 'done' && (
                                                    <ActionButton
                                                        title="View imported data"
                                                        icon={faCheckCircle}
                                                        action={() =>
                                                            dispatch(
                                                                updateAnnotationIsExtractionModalOpen({
                                                                    id: annotation.id,
                                                                    isExtractionModalOpen: true,
                                                                }),
                                                            )
                                                        }
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </div>
                )}
                {paperId && (
                    <Alert color="success">
                        Annotations successfully saved{' '}
                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                    </Alert>
                )}
            </ModalBody>
            {annotations.filter((annotation) => annotation.type !== SURVEY_TABLES_IRI && annotation.type !== CSVW_TABLE_IRI).length > 0 &&
            !paperId ? (
                <ModalFooter>
                    <ButtonWithLoading color="primary" onClick={handleSave} isLoading={isLoading}>
                        Save
                    </ButtonWithLoading>
                </ModalFooter>
            ) : null}
        </Modal>
    );
};

export default Save;
