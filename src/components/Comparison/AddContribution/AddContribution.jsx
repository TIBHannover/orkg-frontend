import { faExternalLinkAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Alert, Button, FormGroup, Input, InputGroup, Label, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import REGEX from '@/constants/regex';
import ROUTES from '@/constants/routes';
import { getPaperByDoi } from '@/services/backend/papers';
import { getResources } from '@/services/backend/resources';
import { getStatementsBySubjectAndPredicate } from '@/services/backend/statements';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & span {
        cursor: pointer;
        border: 2px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    overflow-wrap: anywhere;

    &:last-child {
        border-bottom-right-radius: ${(props) => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

export default function AddContribution({
    showDialog,
    toggle,
    allowCreate = false,
    onCreateContribution = () => {},
    onCreatePaper = () => {},
    onAddContributions,
    initialSearchQuery,
}) {
    const [searchPaper, setSearchPaper] = useState(initialSearchQuery || '');
    const [currentPage, setCurrentPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [paperResult, setPaperResult] = useState([]);
    const [selectedContributions, setSelectedContributions] = useState([]);

    const numberOfPaper = 5;

    const loadMoreResults = (searchQuery, page) => {
        if (searchQuery?.length === 0) {
            setPaperResult([]);
            setCurrentPage(0);
            setIsNextPageLoading(false);
            return;
        }
        setIsNextPageLoading(true);
        const doi = searchQuery?.startsWith('http') ? searchQuery?.substring(searchQuery.indexOf('10.')) : searchQuery;

        // The entry is a DOI, check if it exists in the database
        if (doi?.trim().match(new RegExp(REGEX.DOI_ID))) {
            getPaperByDoi(doi.trim())
                .then((result) =>
                    getStatementsBySubjectAndPredicate({
                        subjectId: result.id,
                        predicateId: PREDICATES.HAS_CONTRIBUTION,
                    })
                        .then((contributions) => ({
                            ...result,
                            contributions: contributions
                                .sort((a, b) => a.object.label.localeCompare(b.object.label))
                                .map((contribution) => ({ ...contribution.object, checked: false })),
                            label: result.title,
                        }))
                        .then((paperData) => {
                            setPaperResult([paperData]);
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            setCurrentPage(0);
                        }),
                )
                .catch(() => {
                    if (page === 0) {
                        setPaperResult([]);
                    }
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                });
        } else {
            getResources({
                page: page || currentPage,
                size: numberOfPaper,
                q: searchQuery,
                include: [CLASSES.PAPER],
                returnContent: true,
            })
                .then((results) => {
                    if (results.length > 0) {
                        const paper = results.map((resource) =>
                            getStatementsBySubjectAndPredicate({
                                subjectId: resource.id,
                                predicateId: PREDICATES.HAS_CONTRIBUTION,
                            }).then((contributions) => ({
                                ...resource,
                                contributions: contributions
                                    .sort((a, b) => a.object.label.localeCompare(b.object.label))
                                    .map((contribution) => ({ ...contribution.object, checked: false })),
                            })),
                        );
                        Promise.all(paper).then((paperData) => {
                            setPaperResult([...(page === 0 ? [] : paperResult), ...paperData]);
                            setIsNextPageLoading(false);
                            setHasNextPage(!(results.length < numberOfPaper));
                            setCurrentPage(page);
                        });
                    } else {
                        if (page === 0) {
                            setPaperResult([]);
                        }
                        setIsNextPageLoading(false);
                        setHasNextPage(false);
                    }
                })
                .catch((error) => {
                    console.log(error);
                    toast.error('Something went wrong while loading search results.');
                });
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedGetLoadMoreResults = useCallback(debounce(loadMoreResults, 500), []);

    const toggleContribution = (contributionsID) => {
        if (!selectedContributions.includes(contributionsID)) {
            setSelectedContributions((prev) => [...prev, contributionsID]);
        } else {
            setSelectedContributions(selectedContributions.filter((i) => i !== contributionsID));
        }
    };

    const togglePaper = (paper, e) => {
        let newSelectedContributions = selectedContributions;
        if (paper.contributions.length > 0) {
            paper.contributions.map((contribution) => {
                if (e.target.checked && !selectedContributions.includes(contribution.id)) {
                    newSelectedContributions = [...newSelectedContributions, contribution.id];
                } else if (!e.target.checked) {
                    newSelectedContributions = [...newSelectedContributions.filter((i) => i !== contribution.id)];
                }
                return null;
            });
        }
        setSelectedContributions(newSelectedContributions);
    };

    useEffect(() => {
        setSearchPaper(initialSearchQuery);
    }, [initialSearchQuery]);

    useEffect(() => {
        setHasNextPage(false);
        setCurrentPage(0);
        setSelectedContributions([]);
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults(searchPaper, 0);
    }, [searchPaper]);

    return (
        <Modal isOpen={showDialog} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Add contribution</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="title">Paper title or DOI</Label>
                    <InputGroup>
                        <Input
                            value={searchPaper}
                            placeholder="Search contributions by paper title or DOI..."
                            type="text"
                            name="title"
                            id="title"
                            onChange={(e) => setSearchPaper(e.target.value)}
                            maxLength={MAX_LENGTH_INPUT}
                        />
                    </InputGroup>
                </FormGroup>
                <div>
                    {isNextPageLoading && searchPaper && paperResult.length === 0 && (
                        <ContentLoader style={{ width: '100% !important' }} width="100%" height="100%" viewBox="0 0 100 20" speed={2}>
                            <rect x="0" y="0" width="100%" height="2" />
                            <rect x="0" y="5" width="100%" height="2" />
                            <rect x="0" y="10" width="100%" height="2" />
                            <rect x="0" y="15" width="100%" height="2" />
                        </ContentLoader>
                    )}
                    {!isNextPageLoading && searchPaper && paperResult.length === 0 && (
                        <div>
                            <div className="text-center mt-4 mb-4">
                                There are no results, please try a different search term{' '}
                                {allowCreate && (
                                    <>
                                        or{' '}
                                        <Button color="light" size="sm" onClick={() => onCreatePaper(searchPaper)}>
                                            Add new paper
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {paperResult.length > 0 && (
                        <>
                            <Alert color="info">
                                Select the contributions you want to add{' '}
                                {allowCreate && (
                                    <>
                                        or you click on <FontAwesomeIcon icon={faPlusCircle} className="text-primary" /> if you want to create a new
                                        contribution for an existing paper
                                    </>
                                )}
                            </Alert>
                            <ListGroup>
                                {paperResult.map((paper, index) => (
                                    <StyledListGroupItem key={`result-${index}`} className="pt-2 pb-2">
                                        <Label check className="pe-2 ps-2">
                                            <Input type="checkbox" onChange={(e) => togglePaper(paper, e)} /> <PaperTitle title={paper.label} />{' '}
                                            <Tooltip content="Open paper in new window">
                                                <span>
                                                    <Link
                                                        title="View the paper page"
                                                        target="_blank"
                                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id })}
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                    </Link>
                                                </span>
                                            </Tooltip>
                                            {allowCreate && (
                                                <Tooltip content="Create new contribution for this paper">
                                                    <span className="ms-2">
                                                        <Button color="link" className="p-0" size="lg" onClick={() => onCreateContribution(paper.id)}>
                                                            <FontAwesomeIcon icon={faPlusCircle} />
                                                        </Button>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </Label>
                                        {paper.contributions.length > 1 && (
                                            <ul style={{ listStyle: 'none' }}>
                                                {paper.contributions.map((contribution) => (
                                                    <li key={`ccb${contribution.id}`}>
                                                        <Input
                                                            type="checkbox"
                                                            checked={selectedContributions.includes(contribution.id)}
                                                            onChange={() => toggleContribution(contribution.id)}
                                                        />{' '}
                                                        <Label check className="pe-1 ps-1 mb-0">
                                                            {contribution.label}
                                                        </Label>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </StyledListGroupItem>
                                ))}
                            </ListGroup>
                        </>
                    )}

                    {!isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-end action">
                            <div
                                className="btn btn-link btn-sm"
                                onClick={() => loadMoreResults(searchPaper, currentPage + 1)}
                                onKeyDown={(e) => (e.keyCode === 13 ? loadMoreResults(searchPaper, currentPage + 1) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                + Load more
                            </div>
                        </StyledLoadMoreButton>
                    )}
                    {isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-end action">
                            <span className="btn btn-link btn-sm">Loading...</span>
                        </StyledLoadMoreButton>
                    )}
                </div>
            </ModalBody>
            <ModalFooter className="d-flex">
                {allowCreate && (
                    <div className="flex-grow-1">
                        <Button color="light" onClick={() => onCreatePaper(searchPaper)}>
                            Add new paper
                        </Button>
                    </div>
                )}

                <Button
                    disabled={selectedContributions.length === 0}
                    color="primary"
                    className="float-end"
                    onClick={() => {
                        onAddContributions(selectedContributions);
                        setSelectedContributions([]);
                        toggle();
                    }}
                >
                    Add {pluralize('contribution', selectedContributions.length, false)}
                    {selectedContributions.length > 0 && ` (${selectedContributions.length})`}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
AddContribution.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    initialSearchQuery: PropTypes.string,
    toggle: PropTypes.func.isRequired,
    onAddContributions: PropTypes.func.isRequired,
    allowCreate: PropTypes.bool,
    onCreateContribution: PropTypes.func,
    onCreatePaper: PropTypes.func,
};
