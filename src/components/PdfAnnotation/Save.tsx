import { Cite } from '@citation-js/core';
import { faCheck, faCheckCircle, faPen, faSpinner, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, ButtonGroup, Input, Label, Modal, TextField, toast } from '@heroui/react';
import { uniqueId } from 'lodash';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ActionButton from '@/components/ActionButton/ActionButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import useMembership from '@/components/hooks/useMembership';
import { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';
import { CLASSES, PREDICATES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import createPaperMergeIfExists from '@/helpers/createPaperMergeIfExists';
import { reverse } from '@/lib/namedRoute';
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

    const textAnnotations = annotations.filter((a) => a.type !== SURVEY_TABLES_IRI && a.type !== CSVW_TABLE_IRI);
    const tableAnnotations = annotations.filter((a) => a.type === SURVEY_TABLES_IRI || a.type === CSVW_TABLE_IRI);

    const handleSave = async () => {
        const { paperTitle, paperAuthors, paperPublicationMonth, paperPublicationYear, doi: _doi, publishedIn } = paperData;
        const _title = saveBy === 'doi' ? paperTitle : title;

        if (!_title) {
            if (saveBy === 'doi') {
                toast.danger("The DOI data is not fetched. Enter a valid DOI and click 'Lookup'");
            } else {
                toast.danger('Please enter a paper title');
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

        for (const annotation of textAnnotations) {
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
            toast.danger('Please enter a DOI');
            return;
        }

        setDoiIsFetching(true);

        await Cite.async(doi)
            .catch((e: Error) => {
                switch (e.message) {
                    case 'This format is not supported or recognized':
                        toast.danger('This format is not supported or recognized');
                        break;
                    case 'Server responded with status code 404':
                        toast.danger('No paper has been found');
                        break;
                    default:
                        toast.danger('An error occurred, reload the page and try again');
                        break;
                }
                setDoiIsFetching(false);
                return null;
            })
            // @ts-expect-error legacy untyped Cite return
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
        <Modal.Backdrop
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) handleClose();
            }}
            isDismissable
        >
            <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Save annotations</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        {!paperId && textAnnotations.length > 0 && (
                            <>
                                <div>
                                    <Label className="mb-1 inline-block">Add paper by</Label>
                                    <br />
                                    <ButtonGroup size="sm">
                                        <Button variant={saveBy === 'doi' ? 'primary' : 'secondary'} onPress={() => setSaveBy('doi')}>
                                            Paper DOI
                                        </Button>
                                        <Button variant={saveBy === 'title' ? 'primary' : 'secondary'} onPress={() => setSaveBy('title')}>
                                            Paper title
                                        </Button>
                                    </ButtonGroup>
                                </div>
                                <hr className="border-border" />
                                {saveBy === 'doi' && (
                                    <div>
                                        <Label className="mb-1 inline-block" htmlFor="doiInput">
                                            Paper DOI
                                        </Label>
                                        <div className="flex h-9 items-stretch">
                                            <TextField aria-label="Paper DOI" className="min-w-0 flex-1" value={doi} onChange={setDoi}>
                                                <Input id="doiInput" type="url" className="!h-9 !rounded-e-none" />
                                            </TextField>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="!h-9 !rounded-s-none -ms-px min-w-[130px]"
                                                onPress={fetchDoi}
                                                isDisabled={doiIsFetching}
                                                data-test="lookupDoi"
                                            >
                                                {!doiIsFetching ? 'Lookup' : <FontAwesomeIcon icon={faSpinner} spin />}
                                            </Button>
                                        </div>
                                        {paperData.paperTitle && (
                                            <p className="mt-2">
                                                <strong>Paper title:</strong> {paperData.paperTitle}
                                            </p>
                                        )}
                                    </div>
                                )}
                                {saveBy === 'title' && (
                                    <TextField fullWidth value={title} onChange={setTitle}>
                                        <Label htmlFor="titleInput">Paper title</Label>
                                        <Input id="titleInput" type="text" />
                                    </TextField>
                                )}
                            </>
                        )}
                        {!paperId && textAnnotations.length === 0 && (
                            <Alert className="bg-danger/10 text-danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>You didn&apos;t make any text annotations yet, so there is nothing to save</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                        {tableAnnotations.length > 0 && (
                            <div>
                                <p>You have made the following table annotations:</p>
                                <table className="w-full border border-border [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1">
                                    <thead>
                                        <tr>
                                            <th>Table</th>
                                            <th>Page</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableAnnotations.map((annotation, index) => (
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
                                </table>
                            </div>
                        )}
                        {paperId && (
                            <Alert className="bg-success/10 text-success">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>
                                        Annotations successfully saved{' '}
                                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                                    </Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                    </Modal.Body>
                    {textAnnotations.length > 0 && !paperId ? (
                        <Modal.Footer>
                            <ButtonWithLoading variant="primary" onPress={handleSave} isLoading={isLoading}>
                                Save
                            </ButtonWithLoading>
                        </Modal.Footer>
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default Save;
