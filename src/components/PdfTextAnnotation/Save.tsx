import { Cite } from '@citation-js/core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import Link from 'next/link';
import { CLASSES, PREDICATES, RESOURCES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import createPaperMergeIfExists from 'helpers/createPaperMergeIfExists';
import { uniqueId } from 'lodash';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Alert, Button, ButtonGroup, FormGroup, Input, InputGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Author, CreateContributionData, NewContribution } from 'services/backend/types';
import { RootStore } from 'slices/types';
import { parseCiteResult } from 'utils';

type SaveProps = {
    toggle: () => void;
    isOpen: boolean;
};

const Save: FC<SaveProps> = ({ toggle, isOpen }) => {
    const user = useSelector((state: RootStore) => state.auth.user);

    // @ts-expect-error
    const annotations = useSelector((state) => state.pdfTextAnnotation.annotations);
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

        for (const annotation of annotations) {
            const resourceId: string = uniqueId('#');
            createContributionData.resources![resourceId] = {
                label: annotation.type,
                classes: [annotation.type, CLASSES.SENTENCE],
            };
            const literalId: string = uniqueId('#');
            createContributionData.literals![literalId] = {
                label: annotation.content.text,
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
                observatories: user && 'observatory_id' in user && user.observatory_id ? [user.observatory_id] : [],
                organizations: user && 'organization_id' in user && user.organization_id ? [user.organization_id] : [],
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
                {!paperId && annotations.length > 0 && (
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
                                            {!doiIsFetching ? 'Lookup' : <Icon icon={faSpinner} spin />}
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
                {!paperId && annotations.length === 0 && (
                    <Alert color="danger">You didn't make any annotations yet, so there is nothing to save</Alert>
                )}

                {paperId && (
                    <Alert color="success">
                        Annotations successfully saved
                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                    </Alert>
                )}
            </ModalBody>
            {annotations.length && !paperId ? (
                <ModalFooter>
                    <ButtonWithLoading color="primary" onClick={handleSave} isLoading={isLoading}>
                        Save
                    </ButtonWithLoading>
                </ModalFooter>
            ) : null}
        </Modal>
    );
};

Save.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export default Save;
